import {
  ArrowRight,
  BeakerIcon as Beard,
  Crown,
  Droplets,
  Scissors,
  Sparkles,
  SprayCanIcon as Spray,
  type LucideIcon,
} from "lucide-react";
import PageSection from "@/components/common/PageSection";
import { Headline } from "@/components/common/Headline";
import type { HomeServices } from "@/types/cms";

const ICONS: Record<string, LucideIcon> = {
  scissors: Scissors,
  beard: Beard,
  spray: Spray,
  crown: Crown,
  sparkles: Sparkles,
  droplets: Droplets,
};

interface ServicesProps {
  content: HomeServices;
  whatsappUrl: string;
}

const Services = ({ content, whatsappUrl }: ServicesProps) => {
  return (
    <PageSection id="services" className="bg-foreground text-background">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          {content.eyebrow}
        </span>
        <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {content.title}
        </h2>
        <Headline className="mx-auto mt-5" />
        <p className="mt-5 text-background/70">{content.subtitle}</p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {content.items.map((service) => {
          const Icon = ICONS[service.icon] ?? Scissors;
          return (
            <div
              key={service.name}
              className="flex flex-col items-center rounded-2xl border border-background/10 bg-background/5 p-8 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-4 ring-primary/10">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-serif text-2xl font-bold">
                {service.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-background/70">
                {service.description}
              </p>
              <div className="mt-6 flex w-full items-center justify-between border-t border-background/10 pt-5">
                <span className="text-2xl font-bold text-primary">
                  {service.price}
                </span>
                <a
                  href="/reservar"
                  className="group/link -mr-2 inline-flex min-h-11 items-center gap-1 px-2 text-sm font-medium text-background/80 transition-colors hover:text-primary"
                >
                  Reservar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
};

export default Services;
