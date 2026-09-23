import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import PageSection from "@/components/common/PageSection";
import { Headline } from "@/components/common/Headline";
import { Button } from "@/components/ui/button";
import type { HomeContact } from "@/types/cms";
import type { SettingsBusiness } from "@/server/models";

interface ContactProps {
  content: HomeContact;
  business: SettingsBusiness;
}

interface ContactItem {
  title: string;
  description: string;
  icon: LucideIcon;
  url?: string;
}

const Contact = ({ content, business }: ContactProps) => {
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
