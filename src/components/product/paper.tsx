import { clsx } from "clsx";

/**
 * A page of paper at true A4 proportions (1 : 1.414). Covers are the product,
 * so they are never recoloured or filtered; the paper stays white in dark mode
 * the way a printed sheet would.
 */
export function Paper({
  src,
  alt,
  className,
  priority = false,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "relative aspect-[1/1.414] overflow-hidden rounded-[var(--radius-md)] border border-black/10 bg-white shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        width={400}
        height={566}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        className="absolute inset-0 h-full w-full object-cover object-top"
        draggable={false}
      />
      {children}
    </div>
  );
}

/** Up to four member covers fanned like a small pile of printouts. */
export function PaperStack({
  covers,
  alt,
  className,
  priority = false,
}: {
  covers: string[];
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const pile = covers.slice(0, 3);
  const turns = ["-rotate-6 -translate-x-[6%]", "rotate-3 translate-x-[5%]", "rotate-0"];
  return (
    <div className={clsx("relative aspect-[1/1.414]", className)}>
      {pile.map((src, i) => {
        const top = i === pile.length - 1;
        return (
          <div
            key={src + i}
            className={clsx(
              "absolute inset-[6%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              turns[i + (3 - pile.length)],
              !top && "group-hover/card:scale-[0.98]",
              i === 0 && "group-hover/card:-rotate-[9deg] group-hover/card:-translate-x-[10%]",
              i === 1 && pile.length === 3 && "group-hover/card:rotate-[6deg] group-hover/card:translate-x-[9%]",
            )}
          >
            <Paper src={src} alt={top ? alt : ""} priority={priority && top} className="h-full w-full" />
          </div>
        );
      })}
    </div>
  );
}
