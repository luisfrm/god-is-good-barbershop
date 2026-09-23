import type { Metadata } from "next";
import About from "@/components/home/About";
import Contact from "@/components/home/Contact";
import CtaBand from "@/components/home/CtaBand";
import Faq from "@/components/home/Faq";
import Gallery from "@/components/home/Gallery";
import HeroSection from "@/components/home/HeroSection";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import JsonLd from "@/components/common/JsonLd";
import { getContentOrThrow } from "@/server/services/content";
import {
  getBusinessSettings,
  getSchedulingSettings,
} from "@/server/services/settings";
import { buildFaqJsonLd, truncateDescription } from "@/lib/seo";

/** ISR — refreshed on CMS save, otherwise every 15 minutes. */
export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  const [meta, hero] = await Promise.all([
    getContentOrThrow("site.meta"),
    getContentOrThrow("home.hero"),
  ]);
  const title = `${meta.name} | Barbería Clásica en Maracaibo`;
  const description = truncateDescription(meta.description);
  const image = hero.imageDesktop;

  return {
    title: {
      default: title,
      template: `%s | ${meta.name}`,
    },
    description,
    manifest: "/site.webmanifest",
    keywords: meta.keywords,
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: meta.name,
      locale: "es_VE",
      url: "/",
      title,
      description,
      images: image ? [{ url: image, alt: hero.imageAlt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function Home() {
  const [
    hero,
    services,
    about,
    gallery,
    testimonials,
    faq,
    contact,
    cta,
    business,
    scheduling,
  ] = await Promise.all([
    getContentOrThrow("home.hero"),
    getContentOrThrow("home.services"),
    getContentOrThrow("home.about"),
    getContentOrThrow("home.gallery"),
    getContentOrThrow("home.testimonials"),
    getContentOrThrow("home.faq"),
    getContentOrThrow("home.contact"),
    getContentOrThrow("home.cta"),
    getBusinessSettings(),
    getSchedulingSettings(),
  ]);

  const faqJsonLd = buildFaqJsonLd(faq.items);

  return (
    <main className="min-h-dvh">
      {faqJsonLd && <JsonLd id="ld-faq" data={faqJsonLd} />}

      <HeroSection content={hero} />
      <Services content={services} whatsappUrl={business.whatsappUrl} />
      <About content={about} />
      <Gallery content={gallery} />
      <Testimonials content={testimonials} />
      <Faq content={faq} />
      <CtaBand content={cta} whatsappUrl={business.whatsappUrl} />
      <Contact content={contact} business={business} scheduling={scheduling} />
    </main>
  );
}
