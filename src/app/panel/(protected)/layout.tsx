import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
} from "lucide-react";
import { logoutAction } from "@/app/panel/actions";
import { requireUser } from "@/server/services/auth";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Dashboard", href: "/panel/dashboard", icon: LayoutDashboard },
  { name: "Calendario", href: "/panel/calendar", icon: CalendarDays },
  { name: "Citas", href: "/panel/appointments", icon: Calendar },
  { name: "Contenido", href: "/panel/content", icon: FileText },
  { name: "Ajustes", href: "/panel/settings", icon: Settings },
];

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-muted">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Scissors className="h-5 w-5 text-primary" />
          <span className="font-serif text-lg font-semibold text-foreground">
            Panel
          </span>
        </div>

        <div className="border-b border-border">
          <Link
            href="/"
            className="block px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ← Volver al sitio
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navigationItems.map((item) => (
            <PanelNavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur lg:hidden">
          <Link href="/panel/dashboard" className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="font-serif font-semibold">Panel</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-muted-foreground hover:text-destructive"
            >
              Salir
            </button>
          </form>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
          {navigationItems.map((item) => (
            <PanelNavLink key={item.href} item={item} compact />
          ))}
        </div>

        <main className="p-6 pb-24 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function PanelNavLink({
  item,
  compact,
}: {
  item: (typeof navigationItems)[number];
  compact?: boolean;
}) {
  // Server component cannot read pathname; use CSS-free plain links with
  // active styling applied client-side would need JS — keep simple plain links.
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
        compact && "rounded-md border border-border px-3 py-1.5 text-xs"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.name}
    </Link>
  );
}
