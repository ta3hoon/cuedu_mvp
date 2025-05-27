import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n'; // Adjust path if i18n.ts is elsewhere

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,

  // Make sure these public files are ignored by the middleware
  publicRoutes: ['/cuedu-460705-98698b80d605.json'], // Example if your JSON key is public

  // The `localePrefix` strategy sets the locale in the URL path
  localePrefix: 'as-needed' // 'always', 'never', or 'as-needed'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ko|pt|en)/:path*']
};
