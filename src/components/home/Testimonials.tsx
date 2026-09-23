import { Quote, Star } from "lucide-react";
import PageSection from "@/components/common/PageSection";
import { Headline } from "@/components/common/Headline";
import type { HomeTestimonials } from "@/types/cms";

interface TestimonialsProps {
  content: HomeTestimonials;
}

function clampRating(rating: number): number {
  if (!Number.isFinite(rating)) return 5;
  return Math.max(0, Math.min(5, Math.round(rating)));
}

export default function Testimonials({ content }: TestimonialsProps) {
  if (content.items.length === 0) return null;

  return (
    <PageSection id="testimonios" className="bg-muted">
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

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {content.items.map((item, index) => {
          const rating = clampRating(item.rating);
          return (
            <figure
              key={`${item.author}-${index}`}
              className="relative flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <Quote
                className="absolute right-5 top-5 h-8 w-8 text-primary/15"
                aria-hidden="true"
              />
              <div
                className="flex gap-0.5"
                aria-label={`${rating} de 5 estrellas`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < rating
                        ? "h-4 w-4 fill-primary text-primary"
                        : "h-4 w-4 text-muted-foreground/30"
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                “{item.text}”
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <span className="block font-serif text-base font-bold text-foreground">
                  {item.author}
                </span>
                {item.meta && (
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.meta}
                  </span>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </PageSection>
  );
}
