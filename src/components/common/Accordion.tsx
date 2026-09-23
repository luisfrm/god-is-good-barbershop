"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionEntry {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionEntry[];
  /** Index of the panel expanded on first render. `-1` keeps all closed. */
  defaultOpenIndex?: number;
  /** When false, expanding a panel collapses the previously open one. */
  allowMultiple?: boolean;
  className?: string;
}

/**
 * Animated accordion.
 *
 * Uses the `grid-template-rows: 0fr -> 1fr` technique so the height actually
 * transitions (native <details> snaps on close in every engine). Panels stay
 * mounted — collapsed ones are clipped, not unmounted — so the answers remain
 * in the initial HTML for crawlers and the FAQPage structured data.
 */
export default function Accordion({
  items,
  defaultOpenIndex = -1,
  allowMultiple = true,
  className,
}: AccordionProps) {
  const baseId = useId();
  const [openIndexes, setOpenIndexes] = useState<number[]>(
    defaultOpenIndex >= 0 ? [defaultOpenIndex] : [],
  );

  const toggle = (index: number) => {
    setOpenIndexes((current) => {
      if (current.includes(index)) return current.filter((i) => i !== index);
      return allowMultiple ? [...current, index] : [index];
    });
  };

  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div
            key={`${item.question}-${index}`}
            className={cn(
              "rounded-2xl border border-border bg-muted/40 px-5 py-2 transition-colors duration-300",
              isOpen && "border-primary/40 bg-background",
            )}
          >
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex min-h-11 w-full items-center justify-between gap-4 rounded-lg py-2.5 text-left font-serif text-lg font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {item.question}
                <Plus
                  className={cn(
                    "h-5 w-5 shrink-0 text-primary transition-transform duration-300 ease-out motion-reduce:transition-none",
                    isOpen && "rotate-45",
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>

            {/* Collapsed panels keep DOM presence (SEO) but are hidden from assistive tech. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <p
                  className={cn(
                    "pt-3 pb-2 text-sm leading-relaxed text-muted-foreground transition-opacity duration-300 ease-out motion-reduce:transition-none",
                    isOpen ? "opacity-100" : "opacity-0",
                  )}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
