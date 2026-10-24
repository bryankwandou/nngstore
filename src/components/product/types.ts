/**
 * What a card needs to draw one product or bundle, already in one language.
 * Pages build these from the catalog with toCardModel (src/lib/catalog-view.ts),
 * so the card itself never depends on the catalog's internal shape.
 */
export type CardModel = {
  slug: string;
  kind: "product" | "bundle";
  href: string;
  title: string;
  /** "Answer key · 1,000 questions · SD" */
  meta: string;
  /** short type chip on the cover, e.g. "Answer key" */
  chip: string;
  price: number;
  compareAt?: number;
  /** page 1, A4 ratio */
  cover: string;
  /** page 2 preview shown on hover, products only */
  hoverPage?: string;
  /** up to 4 member covers, bundles only */
  stack?: string[];
  /** number of files, bundles only */
  count?: number;
};
