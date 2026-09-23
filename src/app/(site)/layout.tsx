import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Widgets from "@/components/common/Widgets";
import { getContentOrThrow } from "@/server/services/content";
import { getBusinessSettings } from "@/server/services/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [meta, nav, business] = await Promise.all([
    getContentOrThrow("site.meta"),
    getContentOrThrow("site.nav"),
    getBusinessSettings(),
  ]);

  return (
    <>
      <Header
        shortName={meta.shortName}
        navItems={nav.items}
        ctaHref="/reservar"
        ctaText="Reserva tu cita"
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
