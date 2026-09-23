import PageSection from "@/components/common/PageSection";
import Accordion from "@/components/common/Accordion";
import { Headline } from "@/components/common/Headline";
import type { HomeFaq } from "@/types/cms";

interface FaqProps {
  content: HomeFaq;
}

/**
 * FAQ section. Answers render in the initial HTML (crawlable for the FAQPage
 * structured data) and expand/collapse with a height + fade transition.
 */
export default function Faq({ content }: FaqProps) {
  if (content.items.length === 0) return null;

  return (
    <PageSection id="faq" className="bg-background">
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

      <Accordion
        className="mx-auto mt-12 max-w-3xl"
        items={content.items.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />
    </PageSection>
  );
}
