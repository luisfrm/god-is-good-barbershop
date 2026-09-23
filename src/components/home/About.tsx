import Image from "next/image";
import PageSection from "@/components/common/PageSection";
import { Headline } from "@/components/common/Headline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HomeAbout } from "@/types/cms";

interface AboutProps {
  content: HomeAbout;
}

const About = ({ content }: AboutProps) => {
  return (
    <PageSection id="about" className="bg-background">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="relative">
          <div
            className="absolute -inset-3 rounded-3xl border border-primary/30"
            aria-hidden="true"
          />
          <div className="relative h-[420px] overflow-hidden rounded-2xl shadow-xl ring-1 ring-border md:h-[520px]">
            <Image
              src={content.image}
              alt={content.imageAlt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="md:pl-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {content.eyebrow}
          </span>
          <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {content.title}
          </h2>
          <Headline className="mt-5" />
          {content.paragraphs.map((desc, index) => (
            <p
              className={cn(
                "text-lg leading-relaxed text-muted-foreground",
                index === 0 && "mt-6"
              )}
              key={index}
            >
              {desc}
            </p>
          ))}
          <Button className="mt-8" size="lg" asChild>
            <a href={content.ctaHref}>{content.ctaText}</a>
          </Button>
        </div>
      </div>
    </PageSection>
  );
};

export default About;
