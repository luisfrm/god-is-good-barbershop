import type { Metadata } from "next";
import Link from "next/link";
import {
  CMS_SECTION_GROUPS,
  CMS_SECTION_LABELS,
  type CmsSectionKey,
} from "@/types/cms";
import { findSection } from "@/server/repositories/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contenido · Panel",
};

interface PageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function ContentIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const groups = await Promise.all(
    CMS_SECTION_GROUPS.map(async (group) => ({
      title: group.title,
      rows: await Promise.all(
        group.keys.map(async (key: CmsSectionKey) => ({
          key,
          row: await findSection(key),
        }))
      ),
    }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Contenido
        </h1>
        <p className="mt-1 text-muted-foreground">
          Edita las secciones del sitio. Al guardar, el sitio público se
          revalida al instante.
        </p>
      </div>

      {params.saved && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          Sección «{params.saved}» guardada correctamente.
        </div>
      )}
      {params.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {decodeURIComponent(params.error)}
        </div>
      )}

      {groups.map((group) => (
        <section key={group.title} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {group.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.rows.map(({ key, row }) => (
              <Link
                key={key}
                href={`/panel/content/${encodeURIComponent(key)}`}
                className="group rounded-2xl border border-border bg-background p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <p className="text-xs uppercase tracking-wide text-primary">
                  {key}
                </p>
                <h3 className="mt-1 font-serif text-lg font-bold text-foreground">
                  {CMS_SECTION_LABELS[key]}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  {row
                    ? `Actualizado: ${row.updated_at.slice(0, 10)}`
                    : "⚠ Falta la fila en la base de datos"}
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Editar →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
