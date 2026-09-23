import type { Metadata } from "next";
import About from "@/components/home/About";
import Contact from "@/components/home/Contact";
import HeroSection from "@/components/home/HeroSection";
import Services from "@/components/home/Services";
import { getContentOrThrow } from "@/server/services/content";
import { getBusinessSettings } from "@/server/services/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getContentOrThrow("site.meta");
  const title = `${meta.name} | Barbería Clásica en Maracaibo`;
  return {
    title: {
      default: title,
      template: `%s | ${meta.name}`,
    },
    description: meta.description,
    manifest: "/site.webmanifest",
    keywords: meta.keywords,
    openGraph: {
      type: "website",
      siteName: meta.name,
      locale: "es_VE",
      title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.description,
    },
  };
}

export default async function Home() {
  const [hero, services, about, contact, business] = await Promise.all([
    getContentOrThrow("home.hero"),
    getContentOrThrow("home.services"),
    getContentOrThrow("home.about"),
    getContentOrThrow("home.contact"),
    getBusinessSettings(),
  ]);

  return (
    <main className="min-h-dvh">
      <HeroSection content={hero} />
      <Services content={services} whatsappUrl={business.whatsappUrl} />
      <About content={about} />
      <Contact content={contact} business={business} />
    </main>
  );
}
