import Image from "next/image";
import PageSection from "@/components/common/PageSection";
import { Headline } from "@/components/common/Headline";
import { cn } from "@/lib/utils";
import type { HomeGallery } from "@/types/cms";

interface GalleryProps {
  content: HomeGallery;
}

export default function Gallery({ content }: GalleryProps) {
  if (content.items.length === 0) return null;

  return (
    <PageSection id="galeria" className="bg-background">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          {content.eyebrow}
        </span>
        <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {content.title}
        </h2>
        <Headline className="mx-auto mt-5" />
        {content.subtitle && (
          <p className="mt-5 text-muted-foreground">{content.subtitle}</p>
        )}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
        {content.items.map((item, index) => (
          <div
            key={`${item.src}-${index}`}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted",
              index === 0 && "col-span-2 md:row-span-2 md:aspect-auto"
            )}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </PageSection>
  );
}
