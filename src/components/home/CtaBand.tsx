import { CalendarCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeCta } from "@/types/cms";

interface CtaBandProps {
  content: HomeCta;
  whatsappUrl: string;
}

/** Closing band that drives the last conversion before the footer. */
export default function CtaBand({ content, whatsappUrl }: CtaBandProps) {
  return (
    <section
      id="reservar-cta"
      className="relative w-full overflow-hidden bg-primary py-16 lg:py-20"
    >
      <div
        className="absolute inset-0 opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 12px)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/80">
          {content.eyebrow}
        </span>
        <h2 className="max-w-3xl font-serif text-3xl font-bold tracking-tight text-primary-foreground text-balance sm:text-4xl lg:text-5xl">
          {content.title}
        </h2>
        <p className="max-w-xl text-primary-foreground/85">
          {content.subtitle}
        </p>
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="bg-background text-foreground hover:bg-background/90"
            asChild
          >
            <a href={content.primaryHref}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              {content.primaryText}
            </a>
          </Button>
          {content.secondaryText && (
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Phone className="mr-2 h-4 w-4" />
                {content.secondaryText}
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
