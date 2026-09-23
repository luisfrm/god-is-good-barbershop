/**
 * CMS content section registry (single locale: es).
 * Section keys mirror the `content.section` rows in D1.
 */

export interface NavItem {
  text: string;
  href: string;
}

export interface ServiceItem {
  name: string;
  price: string;
  description: string;
  icon: string;
}

export interface SiteMeta {
  name: string;
  shortName: string;
  slogan: string;
  tagline: string;
  description: string;
  since: number;
  keywords: string[];
}

export interface SiteNav {
  items: NavItem[];
}

export interface HomeHero {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryHref: string;
  ctaSecondaryText: string;
  ctaSecondaryHref: string;
  imageDesktop: string;
  imageMobile: string;
  imageAlt: string;
}

export interface HomeServices {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: ServiceItem[];
}

export interface HomeAbout {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  ctaText: string;
  ctaHref: string;
}

export interface HomeContact {
  eyebrow: string;
  title: string;
  whatsappText: string;
  mapText: string;
  addressTitle: string;
  phoneTitle: string;
  emailTitle: string;
  /** Added in 0004 — optional so older rows keep rendering. */
  hoursTitle?: string;
  formTitle?: string;
  formSubtitle?: string;
  formButtonText?: string;
}

/** Closing call-to-action band shown before the footer. */
export interface HomeCta {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryText: string;
  primaryHref: string;
  secondaryText: string;
  secondaryHref: string;
}

export interface TestimonialItem {
  author: string;
  meta: string;
  rating: number;
  text: string;
}

export interface HomeTestimonials {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HomeFaq {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: FaqItem[];
}

export interface GalleryItem {
  src: string;
  alt: string;
}

export interface HomeGallery {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: GalleryItem[];
}

export interface LegalSection {
  heading: string;
  /** Plain text; blank lines become separate paragraphs. */
  body: string;
}

export interface LegalPage {
  title: string;
  /** ISO date (YYYY-MM-DD) of the last review. */
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

export type CmsSectionData = {
  "site.meta": SiteMeta;
  "site.nav": SiteNav;
  "home.hero": HomeHero;
  "home.services": HomeServices;
  "home.about": HomeAbout;
  "home.contact": HomeContact;
  "home.cta": HomeCta;
  "home.testimonials": HomeTestimonials;
  "home.faq": HomeFaq;
  "home.gallery": HomeGallery;
  "legal.terms": LegalPage;
  "legal.privacy": LegalPage;
};

export type CmsSectionKey = keyof CmsSectionData;

export const CMS_SECTION_KEYS: CmsSectionKey[] = [
  "site.meta",
  "site.nav",
  "home.hero",
  "home.services",
  "home.about",
  "home.gallery",
  "home.testimonials",
  "home.faq",
  "home.contact",
  "home.cta",
  "legal.terms",
  "legal.privacy",
];

export const CMS_SECTION_LABELS: Record<CmsSectionKey, string> = {
  "site.meta": "Marca y SEO",
  "site.nav": "Navegación",
  "home.hero": "Inicio · Hero",
  "home.services": "Inicio · Servicios",
  "home.about": "Inicio · Sobre nosotros",
  "home.gallery": "Inicio · Galería",
  "home.testimonials": "Inicio · Testimonios",
  "home.faq": "Inicio · Preguntas frecuentes",
  "home.contact": "Inicio · Contacto",
  "home.cta": "Inicio · Llamado a la acción",
  "legal.terms": "Legal · Términos y condiciones",
  "legal.privacy": "Legal · Política de privacidad",
};

/** Human label for a section key, tolerating unknown keys. */
export function cmsSectionLabel(key: string): string {
  return isCmsSectionKey(key) ? CMS_SECTION_LABELS[key] : key;
}

/** Sections grouped for the panel content index. */
export const CMS_SECTION_GROUPS: { title: string; keys: CmsSectionKey[] }[] = [
  {
    title: "Marca",
    keys: ["site.meta", "site.nav"],
  },
  {
    title: "Página de inicio",
    keys: [
      "home.hero",
      "home.services",
      "home.about",
      "home.gallery",
      "home.testimonials",
      "home.faq",
      "home.contact",
      "home.cta",
    ],
  },
  {
    title: "Legal",
    keys: ["legal.terms", "legal.privacy"],
  },
];

export function isCmsSectionKey(key: string): key is CmsSectionKey {
  return (CMS_SECTION_KEYS as string[]).includes(key);
}
