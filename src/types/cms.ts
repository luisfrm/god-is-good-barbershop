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
}

export type CmsSectionData = {
  "site.meta": SiteMeta;
  "site.nav": SiteNav;
  "home.hero": HomeHero;
  "home.services": HomeServices;
  "home.about": HomeAbout;
  "home.contact": HomeContact;
};

export type CmsSectionKey = keyof CmsSectionData;

export const CMS_SECTION_KEYS: CmsSectionKey[] = [
  "site.meta",
  "site.nav",
  "home.hero",
  "home.services",
  "home.about",
  "home.contact",
];

export const CMS_SECTION_LABELS: Record<CmsSectionKey, string> = {
  "site.meta": "Marca y SEO",
  "site.nav": "Navegación",
  "home.hero": "Inicio · Hero",
  "home.services": "Inicio · Servicios",
  "home.about": "Inicio · Sobre nosotros",
  "home.contact": "Inicio · Contacto",
};

export function isCmsSectionKey(key: string): key is CmsSectionKey {
  return (CMS_SECTION_KEYS as string[]).includes(key);
}
