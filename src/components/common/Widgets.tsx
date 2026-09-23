"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetsProps {
  whatsappNumber?: string;
}

/** Official WhatsApp SVG Icon with tight viewBox for optimal scaling */
function WhatsAppIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="68 82 364 364"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M308 273c-3-2-6-3-9 1l-12 16c-3 2-5 3-9 1-15-8-36-17-54-47-1-4 1-6 3-8l9-14c2-2 1-4 0-6l-12-29c-3-8-6-7-9-7h-8c-2 0-6 1-10 5-22 22-13 53 3 73 3 4 23 40 66 59 32 14 39 12 48 10 11-1 22-10 27-19 1-3 6-16 2-18m-79 94c-41 0-72-22-72-22l-49 13 12-48s-20-31-20-70c0-72 59-132 132-132 68 0 126 53 126 127 0 72-58 131-129 132m-159 29l83-23a158 158 0 0 0 230-140c0-86-68-155-154-155a158 158 0 0 0-137 236" />
    </svg>
  );
}

export default function Widgets({
  whatsappNumber,
}: Readonly<WidgetsProps>) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cleanWhatsApp = whatsappNumber?.replace(/\D/g, "") ?? "";
  const hasWhatsApp = cleanWhatsApp.length > 0;

  const openWhatsApp = () => {
    if (!cleanWhatsApp) return;
    window.open(`https://wa.me/${cleanWhatsApp}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* WhatsApp Widget */}
      {hasWhatsApp && (
        <button
          onClick={openWhatsApp}
          className="group fixed right-6 bottom-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          type="button"
          aria-label="Contactar por WhatsApp"
          title="Contactar por WhatsApp"
        >
          <WhatsAppIcon className="w-6 h-6 shrink-0" />
          <span className="absolute pointer-events-none right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md">
            Reserva por WhatsApp
          </span>
        </button>
      )}

      {/* Scroll to Top Widget */}
      {/* Fixed slot above WhatsApp so the green button never jumps when this
          one appears. */}
      <button
        onClick={scrollToTop}
        className={cn(
          "bottom-24 group fixed right-6 z-50 bg-primary text-primary-foreground hover:bg-primary/90 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl",
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        )}
        type="button"
        aria-label="Volver arriba"
        title="Volver arriba"
      >
        <ChevronUp className="w-6 h-6" />
        <span className="absolute pointer-events-none right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md">
          Volver arriba
        </span>
      </button>
    </>
  );
}
