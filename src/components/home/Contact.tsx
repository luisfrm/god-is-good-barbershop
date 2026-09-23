import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import PageSection from "@/components/common/PageSection";
import { Headline } from "@/components/common/Headline";
import { Button } from "@/components/ui/button";
import ContactQuickForm from "./ContactQuickForm";
import { formatTimeLabel } from "@/server/scheduling/time";
import { WEEKDAYS, WEEKDAY_LABELS } from "@/types/scheduling";
import type { HomeContact } from "@/types/cms";
import type { SettingsBusiness, SettingsScheduling } from "@/server/models";

interface ContactProps {
  content: HomeContact;
  business: SettingsBusiness;
  scheduling: SettingsScheduling;
}

interface ContactItem {
  title: string;
  description: string;
  icon: LucideIcon;
  url?: string;
}

const Contact = ({ content, business, scheduling }: ContactProps) => {
  const contactItems: ContactItem[] = [
    {
      title: content.addressTitle,
      description: business.address,
      icon: MapPin,
      url: business.mapsUrl,
    },
    {
      title: content.phoneTitle,
      description: business.phoneDisplay,
      icon: Phone,
      url: business.whatsappUrl,
    },
    {
      title: content.emailTitle,
      description: business.email,
      icon: Mail,
      url: `mailto:${business.email}`,
    },
  ];

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    business.address
  )}&output=embed`;

  return (
    <PageSection id="contact" className="bg-muted">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          {content.eyebrow}
        </span>
        <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {content.title}
        </h2>
        <Headline className="mx-auto mt-5" />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {contactItems.map((item) => {
          const Icon = item.icon;
          const card = (
            <>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-4 ring-primary/10">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground transition-colors group-hover:text-primary">
                  {item.description}
                </p>
              </div>
            </>
          );

          if (item.url) {
            return (
              <a
                key={item.title}
                href={item.url}
                target={item.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
              >
                {card}
              </a>
            );
          }

          return (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs"
            >
              {card}
            </div>
          );
        })}
      </div>

      {/* Both columns stretch to the tallest one; the map grows and the form
          absorbs its leftover height so neither ends in a bordered void. */}
      <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="relative min-h-64 flex-1 overflow-hidden rounded-2xl border border-border bg-background shadow-xs">
            <iframe
              title={`Mapa de ${business.businessName}`}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
            <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-foreground">
              <Clock className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              {content.hoursTitle ?? "Horario de atención"}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {WEEKDAYS.map((day) => {
                const schedule = scheduling.workHours.find(
                  (w) => w.day === day
                );
                return (
                  <li
                    key={day}
                    className="flex justify-between gap-4 border-b border-border/60 pb-2 last:border-0"
                  >
                    <span className="text-muted-foreground">
                      {WEEKDAY_LABELS[day]}
                    </span>
                    <span className="font-medium text-foreground">
                      {schedule
                        ? schedule.ranges
                            .map(
                              (r) =>
                                `${formatTimeLabel(r.start)} – ${formatTimeLabel(
                                  r.end
                                )}`
                            )
                            .join(" · ")
                        : "Cerrado"}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Zona horaria: {scheduling.timezone} · citas de{" "}
              {scheduling.sessionDuration} min
            </p>
          </div>
        </div>

        <ContactQuickForm
          phone={business.phone}
          fallbackEmail={business.email}
          title={content.formTitle ?? "Escríbenos"}
          subtitle={
            content.formSubtitle ??
            "Cuéntanos qué necesitas y te respondemos al instante."
          }
          buttonText={content.formButtonText ?? "Enviar mensaje"}
        />
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <a href="/reservar">{content.whatsappText}</a>
        </Button>
        <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
          <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer">
            {content.mapText}
          </a>
        </Button>
      </div>
    </PageSection>
  );
};

export default Contact;
