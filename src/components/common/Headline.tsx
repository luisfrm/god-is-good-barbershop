import { cn } from "@/lib/utils";

export interface HeadlineProps {
  id?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

/**
 * Reusable accent underline bar for section titles and headlines.
 */
export function HeadlineUnderline({
  id,
  width = 48,
  height = 3,
  className,
}: Readonly<HeadlineProps>) {
  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      id={id}
      style={{ width: widthStyle, height: heightStyle }}
      className={cn("rounded-full bg-primary", className)}
      aria-hidden="true"
    />
  );
}

export { HeadlineUnderline as Headline };
export default HeadlineUnderline;
