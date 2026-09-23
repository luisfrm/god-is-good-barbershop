"use client";

import { useFormStatus } from "react-dom";

export function FormError({ error }: { error?: string | null }) {
  const { pending } = useFormStatus();
  if (!error) return null;
  return (
    <p className="mb-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {error}
    </p>
  );
}

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      }
    >
      {pending ? "Guardando..." : children}
    </button>
  );
}
