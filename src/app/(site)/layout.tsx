import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Widgets from "@/components/common/Widgets";
import JsonLd from "@/components/common/JsonLd";
import { getContentOrThrow } from "@/server/services/content";
import {
  getBusinessSettings,
  getSchedulingSettings,
} from "@/server/services/settings";
import { buildLocalBusinessJsonLd } from "@/lib/seo";

/**
 * ISR: the public site is statically generated and refreshed every 15 minutes.
 * Saving from the panel triggers `revalidatePath("/", "layout")` so edits are
 * visible immediately; the interval is only a safety net.
 */
export const revalidate = 900;

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [meta, nav, business, scheduling, testimonials] = await Promise.all([
    getContentOrThrow("site.meta"),
    getContentOrThrow("site.nav"),
    getBusinessSettings(),
    getSchedulingSettings(),
    getContentOrThrow("home.testimonials"),
  ]);

  const organizationJsonLd = buildLocalBusinessJsonLd({
    name: meta.name,
    description: meta.description,
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    telephone: business.phone,
    email: business.email,
    address: business.address,
    mapsUrl: business.mapsUrl,
    since: meta.since,
    priceRange: "$$",
    workHours: scheduling.workHours,
    testimonials: testimonials.items,
  });

  return (
    <>
      <JsonLd id="ld-organization" data={organizationJsonLd} />
      <Header
        shortName={meta.shortName}
        navItems={nav.items}
        ctaHref="/reservar"
        ctaText="Reserva tu cita"
        business={business}
      />
      {children}
      <Footer
        name={meta.name}
        shortName={meta.shortName}
        slogan={meta.slogan}
        tagline={meta.tagline}
        navItems={nav.items}
        business={business}
      />
      <Widgets whatsappNumber={business.phone} />
    </>
  );
}
