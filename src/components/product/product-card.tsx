import Link from "next/link";
import { clsx } from "clsx";
import type { Lang } from "@/lib/i18n";
import { Price } from "@/components/ui/price";
import { Paper, PaperStack } from "./paper";
import { QuickAdd } from "./cart-buttons";
import { TiltCard } from "./tilt";
import type { CardModel } from "./types";

const lookInside = { en: "Look inside", id: "Lihat isi" } as const;
const filesWord = { en: "files", id: "file" } as const;

/**
 * One product or bundle in a grid. The whole card is a single link; the quick
 * add button is a separate focus target layered above it.
 */
export function ProductCard({
  item,
  lang,
  priority = false,
  className,
}: {
  item: CardModel;
  lang: Lang;
  priority?: boolean;
  className?: string;
}) {
  const isBundle = item.kind === "bundle";
  return (
    <TiltCard className={clsx("group/card relative flex flex-col", className)}>
      <div className="[perspective:900px]">
        <div className="tilt-target relative transition-transform duration-200 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] group-hover/card:-translate-y-0.5">
        {isBundle && item.stack?.length ? (
          <PaperStack covers={item.stack} alt={item.title} priority={priority} />
        ) : (
          <Paper src={item.cover} alt={item.title} priority={priority}>
            {item.hoverPage ? (
              <img
                src={item.hoverPage}
                alt=""
                width={400}
                height={566}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-200 group-hover/card:opacity-100"
              />
            ) : null}
            <span className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-[opacity,transform] duration-200 group-hover/card:translate-y-0 group-hover/card:opacity-100 translate-y-1">
              <span className="rounded-full bg-[#14141a]/85 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {lookInside[lang]}
              </span>
            </span>
          </Paper>
        )}
          <span className="pointer-events-none absolute left-2.5 top-2.5 z-[1] rounded-full bg-white/92 px-2 py-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.06em] text-[#1a1a22] shadow-[var(--shadow-sm)] backdrop-blur">
            {isBundle && item.count ? `${item.chip} · ${item.count} ${filesWord[lang]}` : item.chip}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col">
        <h3 className="font-sans text-[0.95rem] font-medium leading-snug tracking-normal">
          <Link
            href={item.href}
            className="line-clamp-2 rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within/card:underline"
          >
            {item.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-[0.82rem] text-muted">{item.meta}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <Price value={item.price} compareAt={item.compareAt} lang={lang} />
          <QuickAdd slug={item.slug} title={item.title} lang={lang} />
        </div>
      </div>
    </TiltCard>
  );
}

/** Same footprint as a card, for loading states. */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col">
      <div className="aspect-[1/1.414] animate-pulse rounded-[var(--radius-md)] bg-surface-2" />
      <div className="mt-3.5 h-4 w-4/5 animate-pulse rounded bg-surface-2" />
      <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-surface-2" />
      <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-surface-2" />
    </div>
  );
}
