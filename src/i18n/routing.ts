import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['en', 'hi'],
  // Default locale
  defaultLocale: 'en'
});
