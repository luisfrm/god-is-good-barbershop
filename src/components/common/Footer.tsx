import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/types/cms";
import type { SettingsBusiness } from "@/server/models";

interface FooterProps {
  name: string;
  shortName: string;
  slogan: string;
  tagline: string;
  navItems: NavItem[];
  business: SettingsBusiness;
}

export default function Footer({
  name,
  shortName,
  slogan,
  tagline,
  navItems,
  business,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-primary/20 bg-foreground text-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight">
                {shortName}
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
                BarberShop
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-background/70">
              {slogan}. {tagline}.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Explorar
            </h3>
            <ul className="space-y-3 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-background/70 transition-colors hover:text-primary"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-3 text-background/70 transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  {business.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 text-background/70 transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  {business.email}
                </a>
              </li>
              <li>
                <span className="flex items-center gap-3 text-background/70">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  {business.address}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Reserva
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-background/70">
              Agenda tu cita en línea o por WhatsApp.
            </p>
            <Button asChild className="w-full">
              <a href="/reservar">Reservar cita</a>
            </Button>
            <a
              href={business.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm text-background/70 transition-colors hover:text-primary"
            >
              Ver ubicación →
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 text-xs text-background/60 md:flex-row">
          <p>
            © {year} <span className="font-medium text-primary">{name}</span>.
            Todos los derechos reservados.
          </p>
          <p>
            Desarrollado por{" "}
            <a
              href="https://luisrivas.site"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
            >
              Luis Rivas
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
