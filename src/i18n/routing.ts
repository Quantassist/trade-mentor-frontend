import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['en', 'hi'],
  // Default locale
  defaultLocale: 'en',
  // Hide locale prefix for default locale (en)
  localePrefix: 'as-needed'
});
