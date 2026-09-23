import { cn } from "@/lib/utils";

interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className }: TitleProps) {
  return (
    <h1 className={cn("text-6xl font-bold text-foreground", className)}>
      {children}
    </h1>
  );
}

export function H2({ children, className }: TitleProps) {
  return (
    <h2
      className={cn(
        "font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className }: TitleProps) {
  return (
    <h3
      className={cn(
        "font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function H4({ children, className }: TitleProps) {
  return (
    <h4 className={cn("font-serif text-2xl font-bold text-foreground", className)}>
      {children}
    </h4>
  );
}
