import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const PageSection = ({ children, className, id }: PageSectionProps) => {
  return (
    <section id={id} className={cn("w-full py-20 lg:py-28", className)}>
      <div className="mx-auto w-full max-w-6xl px-6">{children}</div>
    </section>
  );
};

export default PageSection;
