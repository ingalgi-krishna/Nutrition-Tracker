// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

const TOKEN_NAME = 'nutritrack_auth_token';

// Change to async function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register'];
  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next();
  }

  // Check for API routes that don't need authentication
  if (pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/verify')) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get(TOKEN_NAME)?.value;

  if (!token) {
    // Redirect to login if no token is found
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Verify the token - using await because verifyToken is async
  try {
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check onboarding status
    if (pathname !== '/auth/onboarding' && !pathname.startsWith('/api/') && !decoded.onboardingCompleted) {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url));
    }

    if (pathname === '/auth/onboarding' && decoded.onboardingCompleted) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (err) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Token is valid, continue to protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};