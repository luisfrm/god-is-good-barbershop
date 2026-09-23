import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { formatDateLabel } from "@/lib/seo";
import type { LegalPage } from "@/types/cms";
import type { SettingsBusiness } from "@/server/models";

interface LegalContentProps {
  content: LegalPage;
  business: SettingsBusiness;
}

function paragraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function LegalContent({ content, business }: LegalContentProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-28">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver al inicio
      </Link>

      <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {content.title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Última actualización: {formatDateLabel(content.updatedAt)}
      </p>

      {content.intro && (
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          {content.intro}
        </p>
      )}

      <div className="mt-10 space-y-10">
        {content.sections.map((section, index) => (
          <section key={`${section.heading}-${index}`}>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {index + 1}. {section.heading}
            </h2>
            <div className="mt-3 space-y-3">
              {paragraphs(section.body).map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border border-border bg-muted p-6">
        <h2 className="font-serif text-xl font-bold text-foreground">
          Contacto
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Para ejercer cualquiera de los derechos descritos, escríbenos a{" "}
          <a
            href={`mailto:${business.email}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {business.email}
          </a>
          .
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
            {business.phoneDisplay}
          </li>
          <li className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
            {business.email}
          </li>
          <li className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            {business.address}
          </li>
        </ul>
      </section>
    </article>
  );
}
