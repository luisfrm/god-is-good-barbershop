import type { Metadata } from "next";
import Link from "next/link";
import {
  CMS_SECTION_KEYS,
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
  const rows = await Promise.all(
    CMS_SECTION_KEYS.map(async (key) => ({
      key,
      row: await findSection(key as CmsSectionKey),
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Contenido
        </h1>
        <p className="mt-1 text-muted-foreground">
          Edita las secciones del sitio. Los cambios se publican al guardar.
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ key, row }) => (
          <Link
            key={key}
            href={`/panel/content/${encodeURIComponent(key)}`}
            className="group rounded-2xl border border-border bg-background p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <p className="text-xs uppercase tracking-wide text-primary">{key}</p>
            <h2 className="mt-1 font-serif text-lg font-bold text-foreground">
              {CMS_SECTION_LABELS[key]}
            </h2>
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
    </div>
  );
}
