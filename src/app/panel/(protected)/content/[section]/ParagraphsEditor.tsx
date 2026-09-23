"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ParagraphsEditorProps {
  initialParagraphs: string[];
}

export default function ParagraphsEditor({
  initialParagraphs,
}: ParagraphsEditorProps) {
  const [paragraphs, setParagraphs] = useState<string[]>(() =>
    initialParagraphs.length > 0 ? [...initialParagraphs] : [""]
  );

  const update = (index: number, value: string) => {
    setParagraphs((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const move = (index: number, delta: number) => {
    setParagraphs((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const serialized = paragraphs.map((p) => p.trim()).filter(Boolean);

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="paragraphs"
        value={JSON.stringify(serialized)}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Párrafos</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setParagraphs((prev) => [...prev, ""])}
        >
          + Añadir párrafo
        </Button>
      </div>

      <div className="space-y-2">
        {paragraphs.map((paragraph, index) => (
          <div
            key={index}
            className="flex items-start gap-2 rounded-lg border border-border p-3"
          >
            <textarea
              value={paragraph}
              onChange={(e) => update(index, e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              placeholder="Texto del párrafo…"
            />
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="h-8 rounded-md border border-border px-2 text-xs hover:bg-muted disabled:opacity-40"
                aria-label="Subir"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === paragraphs.length - 1}
                className="h-8 rounded-md border border-border px-2 text-xs hover:bg-muted disabled:opacity-40"
                aria-label="Bajar"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  setParagraphs((prev) => prev.filter((_, i) => i !== index))
                }
                className="h-8 rounded-md border border-destructive/40 px-2 text-xs text-destructive hover:bg-destructive/10"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
