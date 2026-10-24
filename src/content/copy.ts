import type { Lang } from "@/lib/i18n";

/**
 * Every page keeps its copy in its own file under src/content, written through
 * defineCopy. The English object sets the shape and the Indonesian one must
 * match it key for key, so a missing translation fails the type check instead
 * of shipping a blank label.
 */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends (...args: infer A) => infer R
      ? (...args: A) => R
      : T extends object
        ? { readonly [K in keyof T]: Widen<T[K]> }
        : T;

export function defineCopy<const T>(copy: { en: T; id: Widen<T> }) {
  return (lang: Lang): Widen<T> => (lang === "id" ? copy.id : (copy.en as Widen<T>));
}
