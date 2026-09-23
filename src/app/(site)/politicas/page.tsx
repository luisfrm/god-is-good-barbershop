import type { Metadata } from "next";
import LegalContent from "@/components/legal/LegalContent";
import JsonLd from "@/components/common/JsonLd";
import { getContentOrThrow } from "@/server/services/content";
import { getBusinessSettings } from "@/server/services/settings";
import { buildBreadcrumbJsonLd, truncateDescription } from "@/lib/seo";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const [content, business] = await Promise.all([
    getContentOrThrow("legal.terms"),
    getBusinessSettings(),
  ]);
  return {
    title: content.title,
    description: truncateDescription(content.intro),
    alternates: { canonical: "/politicas" },
    openGraph: {
      type: "article",
      siteName: business.businessName,
      title: content.title,
      description: truncateDescription(content.intro),
    },
  };
}

export default async function TermsPage() {
  const [content, business] = await Promise.all([
    getContentOrThrow("legal.terms"),
    getBusinessSettings(),
  ]);

  return (
    <main className="min-h-dvh bg-background pt-16">
      <JsonLd
        id="ld-breadcrumb-terms"
        data={buildBreadcrumbJsonLd(
          [
            { name: "Inicio", path: "/" },
            { name: content.title, path: "/politicas" },
          ],
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        )}
      />
      <LegalContent content={content} business={business} />
    </main>
  );
}
