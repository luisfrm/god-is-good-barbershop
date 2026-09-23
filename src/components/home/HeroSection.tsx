import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { HomeHero } from "@/types/cms";

interface HeroSectionProps {
  content: HomeHero;
}

const HeroSection: React.FC<HeroSectionProps> = ({ content }) => {
  return (
    <section
      id="home"
      className="relative flex h-[820px] w-full items-center justify-center md:h-dvh"
    >
      <Image
        src={content.imageDesktop}
        alt={content.imageAlt}
        priority
        className="absolute z-0 hidden object-cover md:block"
        fill
        sizes="100vw"
      />
      <Image
        src={content.imageMobile}
        alt={content.imageAlt}
        priority
        className="absolute z-0 object-cover md:hidden"
        fill
        sizes="100vw"
      />
      <div
        className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-black/75"
        aria-hidden="true"
      />
      <div className="relative z-20 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <span className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-primary drop-shadow">
          {content.eyebrow}
        </span>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-balance md:text-7xl">
          {content.title}
        </h1>
        <p className="mt-6 text-lg text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] text-balance md:text-xl">
          {content.subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <a href={content.ctaPrimaryHref}>{content.ctaPrimaryText}</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={content.ctaSecondaryHref}>{content.ctaSecondaryText}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
