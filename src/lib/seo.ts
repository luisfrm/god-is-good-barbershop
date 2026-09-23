/**
 * Pure SEO helpers: absolute URLs, sitemap entries and schema.org JSON-LD.
 * Kept free of framework imports so they can be unit-tested in isolation.
 */

import {
  WEEKDAYS,
  type Weekday,
  type WorkDaySchedule,
} from "@/types/scheduling";
import type { FaqItem, TestimonialItem } from "@/types/cms";

export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

/** Every public, indexable route of the site. */
export const PUBLIC_ROUTES: {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/reservar", changeFrequency: "daily", priority: 0.9 },
  { path: "/politicas", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacidad", changeFrequency: "yearly", priority: 0.3 },
];

/** Drop a trailing slash, keeping origin-only bases intact. */
export function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  return trimmed || "http://localhost:3000";
}

export function absoluteUrl(path: string, baseUrl: string): string {
  const base = normalizeBaseUrl(baseUrl);
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildSitemapEntries(
  baseUrl: string,
  lastModified: string
): SitemapEntry[] {
  return PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path, baseUrl),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

/** Google accepts RFC 3339 dates; keep only the date part for stability. */
export function toDateOnly(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1] : new Date().toISOString().slice(0, 10);
}

export function formatDateLabel(value: string): string {
  const [year, month, day] = toDateOnly(value).split("-");
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const monthLabel = months[Number(month) - 1] ?? month;
  return `${Number(day)} de ${monthLabel} de ${year}`;
}

/** Trim text to a meta-description-friendly length without cutting words. */
export function truncateDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Schema.org day codes used by openingHoursSpecification. */
export const SCHEMA_DAY_CODES: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const SCHEMA_DAY_SHORT: Record<Weekday, string> = {
  monday: "Mo",
  tuesday: "Tu",
  wednesday: "We",
  thursday: "Th",
  friday: "Fr",
  saturday: "Sa",
  sunday: "Su",
};

export interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string;
  opens: string;
  closes: string;
}

export function buildOpeningHoursSpecification(
  workHours: WorkDaySchedule[]
): OpeningHoursSpecification[] {
  const specs: OpeningHoursSpecification[] = [];
  for (const day of WEEKDAYS) {
    const schedule = workHours.find((w) => w.day === day);
    if (!schedule) continue;
    for (const range of schedule.ranges) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${SCHEMA_DAY_CODES[day]}`,
        opens: range.start,
        closes: range.end,
      });
    }
  }
  return specs;
}

/** Compact "Mo 09:00-18:00" strings — easier for small crawlers to read. */
export function buildOpeningHoursStrings(
  workHours: WorkDaySchedule[]
): string[] {
  const out: string[] = [];
  for (const day of WEEKDAYS) {
    const schedule = workHours.find((w) => w.day === day);
    if (!schedule) continue;
    for (const range of schedule.ranges) {
      out.push(`${SCHEMA_DAY_SHORT[day]} ${range.start}-${range.end}`);
    }
  }
  return out;
}

export interface LocalBusinessInput {
  name: string;
  description: string;
  url: string;
  image?: string;
  telephone?: string;
  email?: string;
  address?: string;
  mapsUrl?: string;
  since?: number;
  priceRange?: string;
  workHours?: WorkDaySchedule[];
  testimonials?: TestimonialItem[];
}

export function buildAggregateRating(
  testimonials: TestimonialItem[]
): Record<string, unknown> | null {
  const ratings = testimonials
    .map((t) => Number(t.rating))
    .filter((r) => Number.isFinite(r) && r > 0 && r <= 5);
  if (ratings.length === 0) return null;
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return {
    "@type": "AggregateRating",
    ratingValue: Number(average.toFixed(1)),
    reviewCount: ratings.length,
    bestRating: 5,
    worstRating: 1,
  };
}

export function buildLocalBusinessJsonLd(
  input: LocalBusinessInput
): Record<string, unknown> {
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: input.name,
    description: input.description,
    url: absoluteUrl("/", input.url),
    image: input.image,
    priceRange: input.priceRange ?? "$$",
  };

  if (input.telephone) json.telephone = input.telephone;
  if (input.email) json.email = input.email;
  if (input.since) json.foundingDate = String(input.since);
  if (input.mapsUrl) json.hasMap = input.mapsUrl;
  if (input.address) {
    json.address = {
      "@type": "PostalAddress",
      streetAddress: input.address,
      addressCountry: "VE",
    };
  }

  const workHours = input.workHours ?? [];
  if (workHours.length > 0) {
    json.openingHours = buildOpeningHoursStrings(workHours);
    json.openingHoursSpecification = buildOpeningHoursSpecification(workHours);
  }

  const rating = buildAggregateRating(input.testimonials ?? []);
  if (rating) json.aggregateRating = rating;

  return json;
}

export function buildFaqJsonLd(items: FaqItem[]): Record<string, unknown> | null {
  const usable = items.filter((i) => i.question.trim() && i.answer.trim());
  if (usable.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: usable.map((item) => ({
      "@type": "Question",
      name: item.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.trim(),
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
  baseUrl: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path, baseUrl),
    })),
  };
}

/** Canonical URL for a page path, used in `alternates.canonical`. */
export function canonicalFor(path: string, baseUrl: string): string {
  return absoluteUrl(path, baseUrl);
}
