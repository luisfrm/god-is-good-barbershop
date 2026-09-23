"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/whatsapp";

interface ContactQuickFormProps {
  /** Business phone used to build the wa.me deep link. */
  phone: string;
  fallbackEmail: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

/**
 * `text-base` on mobile keeps iOS Safari from zooming in on focus; it drops
 * back to `text-sm` from `sm` up, and `min-h-11` gives every field a 44px
 * touch target.
 */
const inputClass =
  "w-full min-h-11 rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm";

/**
 * Zero-backend contact form: it composes the message and hands it to WhatsApp
 * (or the mail client when no phone is configured), so no sensitive client
 * data is stored in the database.
 *
 * Layout note: on desktop this card is a grid item next to the map + opening
 * hours column, so it stretches to that column's height (much taller than the
 * form itself). Instead of leaving a big bordered void, the card is a flex
 * column and the message field absorbs the leftover height, which keeps the
 * submit button anchored to the bottom edge.
 */
export default function ContactQuickForm({
  phone,
  fallbackEmail,
  title,
  subtitle,
  buttonText,
}: ContactQuickFormProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = `Hola, soy ${name.trim() || "un cliente"}${
      contact.trim() ? ` (${contact.trim()})` : ""
    }. ${message.trim()}`;
    const link = whatsappLink(phone, body);
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = `mailto:${fallbackEmail}?subject=${encodeURIComponent(
      "Consulta desde la web"
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-xs">
      <h3 className="font-serif text-xl font-bold text-foreground">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 flex flex-1 flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Nombre
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} mt-1`}
              placeholder="Tu nombre"
            />
          </label>
          <label className="text-sm font-medium">
            Teléfono o email
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={`${inputClass} mt-1`}
              placeholder="+58 424 000 0000"
            />
          </label>
        </div>
        <label className="flex min-h-0 flex-1 flex-col text-sm font-medium">
          Mensaje
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} mt-1 min-h-24 flex-1 resize-y`}
            placeholder="¿En qué te podemos ayudar?"
          />
        </label>
        <Button type="submit" className="mt-auto min-h-11 w-full shrink-0">
          <Send className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </form>
    </div>
  );
}
