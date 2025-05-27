// In middleware.ts
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n'; // Adjust path
// import { createServerClient } from '@supabase/ssr'; // Example for robust session handling

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  publicRoutes: [
    '/cuedu-460705-98698b80d605.json',
    // Potentially add '/api/auth/callback' if using server-side auth flow
  ],
  localePrefix: 'as-needed',
});

const protectedRoutes = ['/dashboard', '/onboarding']; // Base paths, onboarding includes sub-routes like country-select
const authRoutes = ['/auth/sign-in', '/auth/sign-up']; // Relative to locale

export async function middleware(req: NextRequest) {
  const intlResponse = intlMiddleware(req);
  // If intlMiddleware decided to redirect (e.g., for locale handling), honor that first
  if (intlResponse.status === 307 || intlResponse.status === 308 || intlResponse.headers.has('location')) {
    return intlResponse;
  }

  const { pathname } = req.nextUrl;
  // Determine the effective locale. This might come from the path, or be the default.
  // This logic assumes next-intl successfully sets req.nextUrl.locale or similar.
  // If next-intl doesn't modify req.nextUrl.locale directly after its processing,
  // we might need to extract it from the pathname if a locale prefix is present.
  let effectiveLocale = defaultLocale;
  const firstPathSegment = pathname.split('/')[1];
  if (locales.includes(firstPathSegment)) {
    effectiveLocale = firstPathSegment;
  }
  
  // This is a simplified check. Robust session check on Edge requires @supabase/ssr or similar.
  // For now, we'll assume a cookie `sb-*-auth-token` indicates an active session.
  // THIS IS NOT SECURE FOR PRODUCTION WITHOUT PROPER SERVER-SIDE VERIFICATION.
  const supabaseAuthTokenCookie = Object.keys(req.cookies.getAll()).find(name => name.startsWith('sb-') && name.endsWith('-auth-token'));
  const isAuthenticated = !!supabaseAuthTokenCookie;

  // Adjust path checking to correctly account for locale prefixes
  const pathWithoutLocale = locales.includes(firstPathSegment) ? pathname.substring(pathname.indexOf('/', 1)) : pathname;

  const isProtectedRoute = protectedRoutes.some(route => pathWithoutLocale.startsWith(route));
  // Auth routes are already prefixed with /auth, so ensure they are checked correctly.
  // e.g. /en/auth/sign-in, pathWithoutLocale will be /auth/sign-in
  const isAuthRoute = authRoutes.some(route => pathWithoutLocale.startsWith(route));
  
  // Log for debugging
  // console.log(`Middleware: Path: ${pathname}, PathNoLocale: ${pathWithoutLocale}, Locale: ${effectiveLocale}, IsAuth: ${isAuthenticated}, IsProtected: ${isProtectedRoute}, IsAuthRoute: ${isAuthRoute}`);

  if (!isAuthenticated && isProtectedRoute) {
    // console.log('Redirecting to sign-in');
    const signInUrl = new URL(`/${effectiveLocale}/auth/sign-in`, req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthenticated && isAuthRoute) {
    // console.log('Redirecting to dashboard');
    const dashboardUrl = new URL(`/${effectiveLocale}/dashboard`, req.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return intlResponse; // If no auth redirect, return intl's response
}

export const config = {
  matcher: [
    '/', // Root to ensure default locale redirect if needed
    '/((?!api|_next/static|_next/image|favicon.ico|cuedu-460705-98698b80d605.json).*)', // All other paths except static assets and API
  ],
};
