"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { NavItem } from "@/types/cms";
import type { SettingsBusiness } from "@/server/models";

interface MobileNavigationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shortName: string;
  navItems: NavItem[];
  ctaText: string;
  ctaHref: string;
  business?: SettingsBusiness;
}

export default function MobileNavigation({
  isOpen,
  onOpenChange,
  shortName,
  navItems,
  ctaText,
  ctaHref,
  business,
}: MobileNavigationProps) {
  const handleItemClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-xl font-semibold text-foreground">
            {shortName}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navegación principal de la barbería
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col space-y-6 px-4">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleItemClick}
                className="border-b border-border/50 py-3 text-lg font-medium text-foreground/80 transition-colors duration-200 hover:border-primary/50 hover:text-foreground"
              >
                {item.text}
              </a>
            ))}
          </nav>

          <Button asChild size="lg" className="w-full">
            <a href={ctaHref} onClick={handleItemClick}>
              {ctaText}
            </a>
          </Button>

          {business && (
            <div className="mt-auto space-y-3 border-t border-border/50 pt-6 text-sm text-muted-foreground">
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-3 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" />
                {business.phoneDisplay}
              </a>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 text-primary" />
                {business.email}
              </a>
              <span className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                {business.address}
              </span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
