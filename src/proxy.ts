import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

const ADMIN_GATE_PATH = '/gate/jm-ctrl-2026';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === 'admin';

  // API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Redirect old /login and /register to homepage
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Secret admin gate
  if (pathname === ADMIN_GATE_PATH) {
    if (isLoggedIn && isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // Public routes
  if (
    pathname === '/' ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/v/') ||
    pathname.startsWith('/invite/') ||
    (pathname.includes('/studio/') && pathname.endsWith('/preview'))
  ) {
    return NextResponse.next();
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(ADMIN_GATE_PATH, req.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Protected routes (dashboard, events, studio editor)
  const protectedPrefixes = ['/dashboard', '/events', '/studio'];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(ADMIN_GATE_PATH, req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
