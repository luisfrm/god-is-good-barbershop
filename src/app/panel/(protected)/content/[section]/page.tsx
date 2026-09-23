import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { saveSectionAction } from "@/app/panel/actions";
import { getContentOrThrow } from "@/server/services/content";
import {
  CMS_SECTION_LABELS,
  isCmsSectionKey,
  type CmsSectionKey,
  type HomeAbout,
  type HomeContact,
  type HomeCta,
  type HomeFaq,
  type HomeGallery,
  type HomeHero,
  type HomeServices,
  type HomeTestimonials,
  type LegalPage,
  type SiteMeta,
  type SiteNav,
} from "@/types/cms";
import ServicesItemsEditor from "./ServicesItemsEditor";
import NavItemsEditor from "./NavItemsEditor";
import ParagraphsEditor from "./ParagraphsEditor";
import RepeaterEditor from "@/components/panel/RepeaterEditor";
import { FormError, SubmitButton } from "@/components/panel/FormError";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ section: string }>;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;
  if (!isCmsSectionKey(section)) return { title: "Sección · Panel" };
  return { title: `${CMS_SECTION_LABELS[section]} · Panel` };
}

export default async function SectionEditorPage({ params }: PageProps) {
  const { section: raw } = await params;
  if (!isCmsSectionKey(raw)) notFound();
  const section = raw as CmsSectionKey;

  const data = await getContentOrThrow(section);
  const save = saveSectionAction.bind(null, section);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/panel/content"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Contenido
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">
          {CMS_SECTION_LABELS[section]}
        </h1>
        <p className="mt-1 text-xs uppercase tracking-wide text-primary">
          {section}
        </p>
      </div>

      <form action={save} className="space-y-5 rounded-2xl border border-border bg-background p-6 shadow-xs">
        <SectionFields section={section} data={data} />
        <FormError />
        <SubmitButton>Guardar sección</SubmitButton>
      </form>
    </div>
  );
}

function SectionFields({
  section,
  data,
}: {
  section: CmsSectionKey;
  data: unknown;
}) {
  switch (section) {
    case "site.meta": {
      const d = data as SiteMeta;
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" name="name" defaultValue={d.name} />
          <Field label="Nombre corto" name="shortName" defaultValue={d.shortName} />
          <Field label="Eslogan" name="slogan" defaultValue={d.slogan} />
          <Field label="Tagline" name="tagline" defaultValue={d.tagline} />
          <label className="text-sm font-medium sm:col-span-2">
            Descripción SEO
            <textarea
              name="description"
              rows={3}
              defaultValue={d.description}
              className={`${inputClass} mt-1`}
            />
          </label>
          <Field label="Desde" name="since" type="number" defaultValue={String(d.since)} />
          <Field
            label="Keywords (coma-separated)"
            name="keywords"
            defaultValue={d.keywords.join(", ")}
          />
        </div>
      );
    }
    case "site.nav": {
      const d = data as SiteNav;
      return <NavItemsEditor initialItems={d.items} />;
    }
    case "home.hero": {
      const d = data as HomeHero;
      return (
        <div className="grid gap-4">
          <Field label="Eyebrow" name="eyebrow" defaultValue={d.eyebrow} />
          <Field label="Título" name="title" defaultValue={d.title} />
          <Field label="Subtítulo" name="subtitle" defaultValue={d.subtitle} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CTA primario texto" name="ctaPrimaryText" defaultValue={d.ctaPrimaryText} />
            <Field label="CTA primario href" name="ctaPrimaryHref" defaultValue={d.ctaPrimaryHref} />
            <Field label="CTA secundario texto" name="ctaSecondaryText" defaultValue={d.ctaSecondaryText} />
            <Field label="CTA secundario href" name="ctaSecondaryHref" defaultValue={d.ctaSecondaryHref} />
          </div>
          <Field label="Imagen desktop (URL)" name="imageDesktop" defaultValue={d.imageDesktop} />
          <Field label="Imagen móvil (URL)" name="imageMobile" defaultValue={d.imageMobile} />
          <Field label="Alt imagen" name="imageAlt" defaultValue={d.imageAlt} />
        </div>
      );
    }
    case "home.services": {
      const d = data as HomeServices;
      return (
        <div className="grid gap-4">
          <Field label="Eyebrow" name="eyebrow" defaultValue={d.eyebrow} />
          <Field label="Título" name="title" defaultValue={d.title} />
          <Field label="Subtítulo" name="subtitle" defaultValue={d.subtitle} />
          <ServicesItemsEditor initialItems={d.items} />
        </div>
      );
    }
    case "home.about": {
      const d = data as HomeAbout;
      return (
        <div className="grid gap-4">
          <Field label="Eyebrow" name="eyebrow" defaultValue={d.eyebrow} />
          <Field label="Título" name="title" defaultValue={d.title} />
          <ParagraphsEditor initialParagraphs={d.paragraphs} />
          <Field label="Imagen (URL)" name="image" defaultValue={d.image} />
          <Field label="Alt imagen" name="imageAlt" defaultValue={d.imageAlt} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CTA texto" name="ctaText" defaultValue={d.ctaText} />
            <Field label="CTA href" name="ctaHref" defaultValue={d.ctaHref} />
          </div>
        </div>
      );
    }
    case "home.gallery": {
      const d = data as HomeGallery;
      return (
        <div className="grid gap-4">
          <Field label="Eyebrow" name="eyebrow" defaultValue={d.eyebrow} />
          <Field label="Título" name="title" defaultValue={d.title} />
          <Field label="Subtítulo" name="subtitle" defaultValue={d.subtitle} />
          <RepeaterEditor
            name="items"
            label="Imágenes"
            singularLabel="imagen"
            fields={[
              {
                name: "src",
                label: "URL de la imagen",
                required: true,
                fullWidth: true,
                placeholder: "https://…/foto.webp",
              },
              { name: "alt", label: "Texto alternativo", fullWidth: true },
            ]}
            initialItems={d.items.map((i) => ({ ...i }))}
            emptyItem={{ src: "", alt: "" }}
            serialize={(items) => items.filter((i) => String(i.src).trim())}
          />
        </div>
      );
    }
    case "home.testimonials": {
      const d = data as HomeTestimonials;
      return (
        <div className="grid gap-4">
          <Field label="Eyebrow" name="eyebrow" defaultValue={d.eyebrow} />
          <Field label="Título" name="title" defaultValue={d.title} />
          <Field label="Subtítulo" name="subtitle" defaultValue={d.subtitle} />
          <RepeaterEditor
            name="items"
            label="Testimonios"
            singularLabel="testimonio"
            fields={[
              { name: "author", label: "Cliente", required: true },
              { name: "meta", label: "Detalle (ciudad, visita…)" },
              {
                name: "rating",
                label: "Estrellas (1-5)",
                type: "number",
              },
              {
                name: "text",
                label: "Testimonio",
                type: "textarea",
                required: true,
                fullWidth: true,
              },
            ]}
            initialItems={d.items.map((i) => ({ ...i }))}
            emptyItem={{ author: "", meta: "", rating: 5, text: "" }}
            serialize={(items) =>
              items.filter(
                (i) => String(i.author).trim() && String(i.text).trim()
              )
            }
          />
        </div>
      );
    }
    case "home.faq": {
      const d = data as HomeFaq;
      return (
        <div className="grid gap-4">
          <Field label="Eyebrow" name="eyebrow" defaultValue={d.eyebrow} />
          <Field label="Título" name="title" defaultValue={d.title} />
          <Field label="Subtítulo" name="subtitle" defaultValue={d.subtitle} />
          <RepeaterEditor
            name="items"
            label="Preguntas"
            singularLabel="pregunta"
            fields={[
              {
                name: "question",
                label: "Pregunta",
                required: true,
                fullWidth: true,
              },
              {
                name: "answer",
                label: "Respuesta",
                type: "textarea",
                required: true,
                fullWidth: true,
              },
            ]}
            initialItems={d.items.map((i) => ({ ...i }))}
            emptyItem={{ question: "", answer: "" }}
            serialize={(items) =>
              items.filter(
                (i) => String(i.question).trim() && String(i.answer).trim()
              )
            }
          />
        </div>
      );
    }
    case "home.contact": {
      const d = data as HomeContact;
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" name="eyebrow" defaultValue={d.eyebrow} />
          <Field label="Título" name="title" defaultValue={d.title} />
          <Field label="CTA WhatsApp" name="whatsappText" defaultValue={d.whatsappText} />
          <Field label="CTA mapa" name="mapText" defaultValue={d.mapText} />
          <Field label="Label dirección" name="addressTitle" defaultValue={d.addressTitle} />
          <Field label="Label teléfono" name="phoneTitle" defaultValue={d.phoneTitle} />
          <Field label="Label email" name="emailTitle" defaultValue={d.emailTitle} />
          <Field
            label="Título del horario"
            name="hoursTitle"
            defaultValue={d.hoursTitle ?? "Horario de atención"}
          />
          <Field
            label="Título del formulario"
            name="formTitle"
            defaultValue={d.formTitle ?? "Escríbenos"}
          />
          <Field
            label="Subtítulo del formulario"
            name="formSubtitle"
            defaultValue={
              d.formSubtitle ??
              "Cuéntanos qué necesitas y te respondemos al instante."
            }
          />
          <Field
            label="Botón del formulario"
            name="formButtonText"
            defaultValue={d.formButtonText ?? "Enviar mensaje"}
          />
        </div>
      );
    }
    case "home.cta": {
      const d = data as HomeCta;
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" name="eyebrow" defaultValue={d.eyebrow} />
          <Field label="Título" name="title" defaultValue={d.title} />
          <Field label="Subtítulo" name="subtitle" defaultValue={d.subtitle} />
          <Field label="Botón principal" name="primaryText" defaultValue={d.primaryText} />
          <Field label="Enlace principal" name="primaryHref" defaultValue={d.primaryHref} />
          <Field label="Botón secundario" name="secondaryText" defaultValue={d.secondaryText} />
          <Field label="Enlace secundario" name="secondaryHref" defaultValue={d.secondaryHref} />
        </div>
      );
    }
    case "legal.terms":
    case "legal.privacy": {
      const d = data as LegalPage;
      return (
        <div className="grid gap-4">
          <Field label="Título" name="title" defaultValue={d.title} />
          <Field
            label="Última actualización (YYYY-MM-DD)"
            name="updatedAt"
            defaultValue={d.updatedAt}
          />
          <label className="text-sm font-medium">
            Introducción
            <textarea
              name="intro"
              rows={3}
              required
              defaultValue={d.intro}
              className={`${inputClass} mt-1`}
            />
          </label>
          <RepeaterEditor
            name="sections"
            label="Secciones"
            singularLabel="sección"
            fields={[
              {
                name: "heading",
                label: "Encabezado",
                required: true,
                fullWidth: true,
              },
              {
                name: "body",
                label: "Texto (deja una línea en blanco entre párrafos)",
                type: "textarea",
                required: true,
                fullWidth: true,
              },
            ]}
            initialItems={d.sections.map((s) => ({ ...s }))}
            emptyItem={{ heading: "", body: "" }}
            serialize={(items) =>
              items.filter(
                (i) => String(i.heading).trim() && String(i.body).trim()
              )
            }
          />
        </div>
      );
    }
    default:
      return null;
  }
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required
        className={`${inputClass} mt-1`}
      />
    </label>
  );
}
