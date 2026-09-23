"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/cms";
import type { SettingsBusiness } from "@/server/models";
import MobileNavigation from "./MobileNavigation";

interface HeaderProps {
  shortName: string;
  navItems: NavItem[];
  ctaText: string;
  ctaHref: string;
  business?: SettingsBusiness;
}

export default function Header({
  shortName,
  navItems,
  ctaText,
  ctaHref,
  business,
}: HeaderProps) {
  const [activeSection, setActiveSection] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll<HTMLElement>("section[id]");
      const scrollPosition = window.scrollY + 120;

      sections.forEach((section) => {
        if (
          section.offsetTop <= scrollPosition &&
          section.offsetTop + section.offsetHeight > scrollPosition
        ) {
          setActiveSection(section.id);
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <a
          href="#home"
          className="flex min-h-11 flex-col justify-center leading-none transition-all hover:scale-105"
        >
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            {shortName}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            BarberShop
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "border-b-2 py-2 text-sm font-medium transition-colors",
                activeSection === item.href.slice(1)
                  ? "border-b-primary text-foreground"
                  : "border-b-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.text}
            </a>
          ))}
          <Button size="sm" asChild>
            <a href={ctaHref}>{ctaText}</a>
          </Button>
        </nav>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <MobileNavigation
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        shortName={shortName}
        navItems={navItems}
        ctaText={ctaText}
        ctaHref={ctaHref}
        business={business}
      />
    </header>
  );
}
