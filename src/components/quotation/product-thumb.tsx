import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Renders a product's own catalog photo (Product.imageUrl), or a neat
 * placeholder when the product has no photo yet. Never a stand-in/mockup
 * image — callers pass `src` straight from the product record so the
 * thumbnail always reflects that specific product, or nothing at all.
 */
export function ProductThumb({
  src,
  alt,
  size = 32,
  className,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-muted",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <ImageOff className="size-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- fixed-size catalog thumbnail; plain <img> keeps this identical on screen and in the print/PDF document.
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-md border border-border bg-muted object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
