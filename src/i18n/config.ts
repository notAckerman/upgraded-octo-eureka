// Client-safe i18n constants (no server-only imports). Shared by the request
// config and the language switcher.
export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";
export const LOCALE_COOKIE = "NEXT_LOCALE";
