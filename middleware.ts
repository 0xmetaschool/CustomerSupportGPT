import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

/**
 * @dev Middleware function to handle authentication and authorization for protected routes.
 * @param request - The incoming HTTP request.
 * @returns A NextResponse object based on the authentication status.
 */
export async function middleware(request: NextRequest) {
  // Public routes that don't need authentication
  const publicPaths = [
    '/api/auth',
    '/auth',
    '/',
    '/widget',
    '/api/widget',
  ];

  // Check if the current path matches any public paths
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If the path is public, proceed without authentication checks
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Retrieve the authentication token from the cookies
  const token = request.cookies.get('auth_token');

  // If no token is found, return an unauthorized response or redirect to the login page
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    // Verify the token and proceed if valid
    await verifyToken(token.value);
    return NextResponse.next();
  } catch (error) {
    // If the token is invalid, return an unauthorized response or redirect to the login page
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

// Configuration for the middleware to match specific routes
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/create-bot/:path*',
    '/bot/:path*',
    '/widget/:path*'
  ],
};