"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type RepeaterValue = Record<string, string | number>;

export interface RepeaterFieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  fullWidth?: boolean;
}

interface RepeaterEditorProps {
  /** Form field name — serialized as a JSON array in a hidden input. */
  name: string;
  label: string;
  /** Used for the "add" button, e.g. "testimonio" → "+ Añadir testimonio". */
  singularLabel: string;
  fields: RepeaterFieldDef[];
  initialItems: RepeaterValue[];
  emptyItem: RepeaterValue;
  /** Drops incomplete rows before serializing. */
  serialize?: (items: RepeaterValue[]) => RepeaterValue[];
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/**
 * Reusable list editor for CMS sections that store an array of objects
 * (gallery, testimonials, FAQ, legal sections…). Keeps a hidden JSON input in
 * sync so the server action receives plain JSON, exactly like before.
 */
export default function RepeaterEditor({
  name,
  label,
  singularLabel,
  fields,
  initialItems,
  emptyItem,
  serialize,
}: RepeaterEditorProps) {
  const [items, setItems] = useState<RepeaterValue[]>(() =>
    initialItems.length > 0
      ? initialItems.map((item) => ({ ...item }))
      : [{ ...emptyItem }]
  );

  const update = (index: number, key: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const move = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const clean = serialize ? serialize(items) : items;

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(clean)} />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setItems((prev) => [...prev, { ...emptyItem }])}
        >
          + Añadir {singularLabel}
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-border p-4"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((field) => (
                <label
                  key={field.name}
                  className={
                    field.fullWidth
                      ? "text-xs font-medium sm:col-span-2"
                      : "text-xs font-medium"
                  }
                >
                  {field.label}
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      required={field.required}
                      value={String(item[field.name] ?? "")}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        update(index, field.name, e.target.value)
                      }
                      className={`${inputClass} mt-1`}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={String(item[field.name] ?? "")}
                      onChange={(e) =>
                        update(index, field.name, e.target.value)
                      }
                      className={`${inputClass} mt-1`}
                    >
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      required={field.required}
                      value={String(item[field.name] ?? "")}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        update(
                          index,
                          field.name,
                          field.type === "number"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      className={`${inputClass} mt-1`}
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
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
                disabled={index === items.length - 1}
                className="h-8 rounded-md border border-border px-2 text-xs hover:bg-muted disabled:opacity-40"
                aria-label="Bajar"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  setItems((prev) => prev.filter((_, i) => i !== index))
                }
                className="h-8 rounded-md border border-destructive/40 px-3 text-xs text-destructive hover:bg-destructive/10"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay elementos. Añade al menos uno.
        </p>
      )}
    </div>
  );
}
