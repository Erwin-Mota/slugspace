// 🛡️ Next.js Middleware - Security & Request Processing
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 🚨 Block suspicious URL patterns (skip for Next.js internals)
  const url = request.nextUrl.pathname;
  
  // Skip security checks for Next.js internal routes and auth
  if (
    url.startsWith('/_next') ||
    url.startsWith('/api/auth') ||
    url.startsWith('/data')
  ) {
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    return response;
  }
  
  const suspiciousPatterns = [
    /\.\./,              // Path traversal
    /<script/i,          // XSS attempts  
    /union.*select/i,    // SQL injection
    /javascript:/i,      // Script injection
    /onerror=/i,         // Event handler injection
    /<iframe/i,          // iframe injection
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    console.error('🚨 Blocked suspicious request:', url);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
  
  // 🛡️ Add security headers to all responses
  const response = NextResponse.next();
  
  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add request ID for tracking
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

