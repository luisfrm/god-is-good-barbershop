"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  hasRegisteredUsers,
  login as loginService,
  logout as logoutService,
  register as registerService,
  requireUser,
} from "@/server/services/auth";
import { saveContent } from "@/server/services/content";
import {
  saveBusinessSettings,
  saveSchedulingSettings,
  isValidTimezone,
} from "@/server/services/settings";
import {
  createBooking,
  removeAppointment,
  syncToGoogle,
  updateStatus,
} from "@/server/services/appointments";
import { saveGoogleTokens } from "@/server/services/settings";
import type {
  CmsSectionData,
  CmsSectionKey,
  HomeAbout,
  HomeContact,
  HomeCta,
  HomeFaq,
  HomeGallery,
  HomeHero,
  HomeServices,
  HomeTestimonials,
  LegalPage,
  SiteMeta,
  SiteNav,
} from "@/types/cms";
import type {
  AppointmentStatus,
  SchedulePreset,
  Weekday,
  WorkDaySchedule,
} from "@/types/scheduling";
import {
  DEFAULT_SESSION_DURATION,
  DEFAULT_TIMEZONE,
  DEFAULT_WORK_RANGE,
  WEEKDAYS,
} from "@/types/scheduling";
import { buildScheduleForPreset } from "@/server/scheduling/presets";
import {
  addBlockedDate,
  removeBlockedDate,
} from "@/server/services/blockedDates";
import { isCmsSectionKey } from "@/types/cms";

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function parseJsonField<T>(raw: FormDataEntryValue | null, label: string): T {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error(`Campo requerido: ${label}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`JSON inválido en: ${label}`);
  }
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

// ─── Auth ───────────────────────────────────────────────────

export async function loginAction(
  _prev: { error: string | null } | null,
  formData: FormData
): Promise<{ error: string | null }> {
  const email = str(formData, "email");
  const password = str(formData, "password");
  if (!email || !password) return { error: "Email y contraseña son obligatorios" };

  const result = await loginService(email, password);
  if ("error" in result) return { error: result.error };
  redirect("/panel/dashboard");
}

export async function registerAction(
  _prev: { error: string | null } | null,
  formData: FormData
): Promise<{ error: string | null }> {
  const result = await registerService({
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    password: str(formData, "password"),
    confirmPassword: str(formData, "confirm-password"),
  });
  if ("error" in result) return { error: result.error };
  redirect("/panel/dashboard");
}

export async function logoutAction(): Promise<void> {
  await logoutService();
  redirect("/panel/login");
}

export async function hasUsersAction(): Promise<boolean> {
  return hasRegisteredUsers();
}

// ─── First-run setup (/panel/init) ──────────────────────────

/**
 * Bootstrap the panel: creates the first administrator and applies an initial
 * business + schedule configuration in a single step. Only succeeds while no
 * user exists yet.
 */
export async function initPanelAction(
  _prev: { error: string | null } | null,
  formData: FormData
): Promise<{ error: string | null }> {
  if (await hasRegisteredUsers()) {
    redirect("/panel/login");
  }

  const presetRaw = str(formData, "schedulePreset");
  const preset: SchedulePreset = (
    ["everyday", "monFri", "weekends", "custom"] as SchedulePreset[]
  ).includes(presetRaw as SchedulePreset)
    ? (presetRaw as SchedulePreset)
    : "monFri";

  const selectedDays = formData
    .getAll("days")
    .filter((d): d is Weekday => (WEEKDAYS as readonly string[]).includes(String(d)));

  const workHours =
    preset === "custom"
      ? (WEEKDAYS.filter((d) => selectedDays.includes(d)) as Weekday[]).map(
          (day) => ({
            day,
            ranges: [{ ...DEFAULT_WORK_RANGE }],
          })
        )
      : buildScheduleForPreset(preset);

  const timezoneRaw = str(formData, "timezone");
  const timezone =
    timezoneRaw && isValidTimezone(timezoneRaw) ? timezoneRaw : DEFAULT_TIMEZONE;
  const duration = Number(str(formData, "sessionDuration"));
  const sessionDuration =
    Number.isFinite(duration) && duration > 0
      ? Math.round(duration)
      : DEFAULT_SESSION_DURATION;

  // Create the admin account first — this also opens the session.
  const adminEmail = str(formData, "email");
  const result = await registerService({
    name: str(formData, "name"),
    email: adminEmail,
    phone: str(formData, "adminPhone"),
    password: str(formData, "password"),
    confirmPassword: str(formData, "confirm-password"),
  });
  if ("error" in result) return { error: result.error };

  // Best-effort initial configuration. The seed row already holds sane
  // defaults, so a failure here must not block getting into the panel.
  try {
    await saveBusinessSettings({
      businessName: str(formData, "businessName"),
      shortName: str(formData, "shortName"),
      slogan: str(formData, "slogan"),
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      since: Number(str(formData, "since")) || new Date().getFullYear(),
      phone: str(formData, "phone"),
      phoneDisplay: str(formData, "phoneDisplay"),
      whatsappUrl: str(formData, "whatsappUrl"),
      email: str(formData, "businessEmail") || adminEmail,
      address: str(formData, "address"),
      mapsUrl: str(formData, "mapsUrl"),
    });
    await saveSchedulingSettings({ workHours, timezone, sessionDuration });
  } catch (err) {
    console.error("Initial setup config failed:", err);
  }

  revalidatePath("/", "layout");
  redirect("/panel/dashboard");
}

// ─── Content ────────────────────────────────────────────────

export async function saveSectionAction(
  section: string,
  formData: FormData
): Promise<void> {
  await requireUser();
  if (!isCmsSectionKey(section)) {
    redirect(`/panel/content?error=${encodeURIComponent("Sección inválida")}`);
  }

  try {
    switch (section) {
      case "site.meta": {
        const data: SiteMeta = {
          name: str(formData, "name"),
          shortName: str(formData, "shortName"),
          slogan: str(formData, "slogan"),
          tagline: str(formData, "tagline"),
          description: str(formData, "description"),
          since: Number(str(formData, "since")) || new Date().getFullYear(),
          keywords: str(formData, "keywords")
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        };
        await saveContent(section, data);
        break;
      }
      case "site.nav": {
        const items = parseJsonField<SiteNav["items"]>(
          formData.get("items"),
          "items"
        );
        if (!Array.isArray(items) || items.length === 0) {
          redirect(
            `/panel/content?error=${encodeURIComponent(
              "Debe haber al menos un elemento de navegación"
            )}`
          );
        }
        await saveContent(section, { items });
        break;
      }
      case "home.hero": {
        const data: HomeHero = {
          eyebrow: str(formData, "eyebrow"),
          title: str(formData, "title"),
          subtitle: str(formData, "subtitle"),
          ctaPrimaryText: str(formData, "ctaPrimaryText"),
          ctaPrimaryHref: str(formData, "ctaPrimaryHref"),
          ctaSecondaryText: str(formData, "ctaSecondaryText"),
          ctaSecondaryHref: str(formData, "ctaSecondaryHref"),
          imageDesktop: str(formData, "imageDesktop"),
          imageMobile: str(formData, "imageMobile"),
          imageAlt: str(formData, "imageAlt"),
        };
        await saveContent(section, data);
        break;
      }
      case "home.services": {
        const items = parseJsonField<HomeServices["items"]>(
          formData.get("items"),
          "items"
        );
        if (!Array.isArray(items) || items.length === 0) {
          redirect(
            `/panel/content?error=${encodeURIComponent(
              "Debe haber al menos un servicio"
            )}`
          );
        }
        const data: HomeServices = {
          eyebrow: str(formData, "eyebrow"),
          title: str(formData, "title"),
          subtitle: str(formData, "subtitle"),
          items,
        };
        await saveContent(section, data);
        break;
      }
      case "home.about": {
        const paragraphs = parseJsonField<string[]>(
          formData.get("paragraphs"),
          "paragraphs"
        );
        const data: HomeAbout = {
          eyebrow: str(formData, "eyebrow"),
          title: str(formData, "title"),
          paragraphs,
          image: str(formData, "image"),
          imageAlt: str(formData, "imageAlt"),
          ctaText: str(formData, "ctaText"),
          ctaHref: str(formData, "ctaHref"),
        };
        await saveContent(section, data);
        break;
      }
      case "home.gallery": {
        const items = parseJsonField<HomeGallery["items"]>(
          formData.get("items"),
          "items"
        );
        const data: HomeGallery = {
          eyebrow: str(formData, "eyebrow"),
          title: str(formData, "title"),
          subtitle: str(formData, "subtitle"),
          items: Array.isArray(items) ? items : [],
        };
        await saveContent(section, data);
        break;
      }
      case "home.testimonials": {
        const raw = parseJsonField<HomeTestimonials["items"]>(
          formData.get("items"),
          "items"
        );
        const data: HomeTestimonials = {
          eyebrow: str(formData, "eyebrow"),
          title: str(formData, "title"),
          subtitle: str(formData, "subtitle"),
          items: (Array.isArray(raw) ? raw : []).map((item) => ({
            author: item.author,
            meta: item.meta ?? "",
            rating: Math.max(1, Math.min(5, Math.round(Number(item.rating) || 5))),
            text: item.text,
          })),
        };
        await saveContent(section, data);
        break;
      }
      case "home.faq": {
        const items = parseJsonField<HomeFaq["items"]>(
          formData.get("items"),
          "items"
        );
        const data: HomeFaq = {
          eyebrow: str(formData, "eyebrow"),
          title: str(formData, "title"),
          subtitle: str(formData, "subtitle"),
          items: Array.isArray(items) ? items : [],
        };
        await saveContent(section, data);
        break;
      }
      case "home.contact": {
        const data: HomeContact = {
          eyebrow: str(formData, "eyebrow"),
          title: str(formData, "title"),
          whatsappText: str(formData, "whatsappText"),
          mapText: str(formData, "mapText"),
          addressTitle: str(formData, "addressTitle"),
          phoneTitle: str(formData, "phoneTitle"),
          emailTitle: str(formData, "emailTitle"),
          hoursTitle: str(formData, "hoursTitle"),
          formTitle: str(formData, "formTitle"),
          formSubtitle: str(formData, "formSubtitle"),
          formButtonText: str(formData, "formButtonText"),
        };
        await saveContent(section, data);
        break;
      }
      case "home.cta": {
        const data: HomeCta = {
          eyebrow: str(formData, "eyebrow"),
          title: str(formData, "title"),
          subtitle: str(formData, "subtitle"),
          primaryText: str(formData, "primaryText"),
          primaryHref: str(formData, "primaryHref"),
          secondaryText: str(formData, "secondaryText"),
          secondaryHref: str(formData, "secondaryHref"),
        };
        await saveContent(section, data);
        break;
      }
      case "legal.terms":
      case "legal.privacy": {
        const sections = parseJsonField<LegalPage["sections"]>(
          formData.get("sections"),
          "sections"
        );
        if (!Array.isArray(sections) || sections.length === 0) {
          redirect(
            `/panel/content?error=${encodeURIComponent(
              "Debe haber al menos una sección"
            )}`
          );
        }
        const data: LegalPage = {
          title: str(formData, "title"),
          updatedAt: str(formData, "updatedAt"),
          intro: str(formData, "intro"),
          sections,
        };
        await saveContent(section, data);
        break;
      }
      default: {
        redirect(
          `/panel/content?error=${encodeURIComponent("Sección no soportada")}`
        );
      }
    }
  } catch (err) {
    redirect(
      `/panel/content?error=${encodeURIComponent(
        errMsg(err, "Error al guardar la sección")
      )}`
    );
  }

  revalidatePath("/", "layout");
  redirect(`/panel/content?saved=${encodeURIComponent(section)}`);
}

// ─── Settings ───────────────────────────────────────────────

export async function saveBusinessAction(
  _prev: { error: string | null } | null,
  formData: FormData
): Promise<void> {
  await requireUser();
  try {
    await saveBusinessSettings({
      businessName: str(formData, "businessName"),
      shortName: str(formData, "shortName"),
      slogan: str(formData, "slogan"),
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      since: Number(str(formData, "since")),
      phone: str(formData, "phone"),
      phoneDisplay: str(formData, "phoneDisplay"),
      whatsappUrl: str(formData, "whatsappUrl"),
      email: str(formData, "email"),
      address: str(formData, "address"),
      mapsUrl: str(formData, "mapsUrl"),
    });
  } catch (err) {
    redirect(
      `/panel/settings?error=${encodeURIComponent(
        errMsg(err, "Error al guardar los datos de contacto")
      )}`
    );
  }
  revalidatePath("/", "layout");
  redirect("/panel/settings?saved=business");
}

export async function saveSchedulingAction(
  _prev: { error: string | null } | null,
  formData: FormData
): Promise<void> {
  await requireUser();
  try {
    const workHours = parseJsonField<WorkDaySchedule[]>(
      formData.get("workHours"),
      "workHours"
    );
    await saveSchedulingSettings({
      workHours,
      timezone: str(formData, "timezone"),
      sessionDuration: Number(str(formData, "sessionDuration")),
    });
  } catch (err) {
    redirect(
      `/panel/settings/scheduling?error=${encodeURIComponent(
        errMsg(err, "Error al guardar el horario")
      )}`
    );
  }
  revalidatePath("/", "layout");
  redirect("/panel/settings/scheduling?saved=scheduling");
}

// ─── Blocked dates (holidays / time off) ────────────────────

export async function addBlockedDateAction(formData: FormData): Promise<void> {
  await requireUser();
  const result = await addBlockedDate(
    str(formData, "date"),
    str(formData, "reason")
  );
  if (result.error) {
    redirect(
      `/panel/settings/scheduling?error=${encodeURIComponent(result.error)}`
    );
  }
  revalidatePath("/", "layout");
  redirect("/panel/settings/scheduling?saved=blocked");
}

export async function removeBlockedDateAction(formData: FormData): Promise<void> {
  await requireUser();
  await removeBlockedDate(str(formData, "date"));
  revalidatePath("/", "layout");
  redirect("/panel/settings/scheduling?saved=blocked");
}

export async function disconnectGoogleAction(): Promise<void> {
  await requireUser();
  await saveGoogleTokens(null);
  revalidatePath("/panel/settings");
  redirect("/panel/settings?google=disconnected");
}

// ─── Appointments ───────────────────────────────────────────

export async function updateAppointmentStatusAction(input: {
  id: string;
  status: AppointmentStatus;
  returnTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireUser();
  const result = await updateStatus(input.id, input.status);
  revalidatePath(input.returnTo || "/panel/appointments");
  return result;
}

export async function deleteAppointmentAction(input: {
  id: string;
  returnTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireUser();
  const result = await removeAppointment(input.id);
  revalidatePath(input.returnTo || "/panel/appointments");
  return result;
}

export async function syncAppointmentAction(input: {
  id: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireUser();
  const result = await syncToGoogle(input.id);
  revalidatePath("/panel/appointments");
  return result;
}

// ─── Public booking (used by /reservar) ─────────────────────

export async function bookAppointmentAction(
  _prev: { error: string | null; success?: boolean } | null,
  formData: FormData
): Promise<{ error: string | null; success?: boolean }> {
  const result = await createBooking({
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    message: str(formData, "message"),
    date: str(formData, "date"),
    start_time: str(formData, "start_time"),
    end_time: str(formData, "end_time"),
    timezone: str(formData, "timezone"),
  });

  if (result.error) return { error: result.error, success: false };
  redirect("/reservar?booked=1");
}

export type SectionPayload = CmsSectionData[CmsSectionKey];
