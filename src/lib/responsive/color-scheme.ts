/** A frame's forced color scheme; null = follow the system (no emulation). */
export type ForcedScheme = 'light' | 'dark' | null;

/** Valid media features that always / never match, so the surrounding query stays well-formed. */
export const ALWAYS = '(min-width: 0px)';
export const NEVER = '(max-resolution: 0dppx)';

const FEATURE = /\(\s*prefers-color-scheme\s*(?::\s*([a-z-]+)\s*)?\)/gi;

/** Media text with every `(prefers-color-scheme[: x])` made true / false for `scheme`. */
export function forceSchemeMedia(text: string, scheme: 'light' | 'dark'): string {
  return text.replace(FEATURE, (_, value: string | undefined) =>
    // the boolean form `(prefers-color-scheme)` is true for light and dark alike
    !value || value.toLowerCase() === scheme ? ALWAYS : NEVER,
  );
}

/** Cheap pre-check before rewriting. */
export const hasSchemeFeature = (text: string): boolean => /prefers-color-scheme/i.test(text);
