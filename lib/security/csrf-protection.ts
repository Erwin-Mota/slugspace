// 🔒 CSRF Protection System
// Implements CSRF token validation and SameSite cookie protection

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Token storage (in production, use Redis)
const tokenStore = new Map<string, { token: string; expires: number }>();

// Token expiration time (15 minutes)
const TOKEN_EXPIRATION = 15 * 60 * 1000;

// Generate CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Store CSRF token for session
export function storeCSRFToken(sessionId: string, token: string): void {
  tokenStore.set(sessionId, {
    token,
    expires: Date.now() + TOKEN_EXPIRATION
  });
  
  // Cleanup expired tokens
  setTimeout(() => {
    tokenStore.delete(sessionId);
  }, TOKEN_EXPIRATION);
}

// Validate CSRF token
export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  if (Date.now() > stored.expires) {
    tokenStore.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

// Middleware to add CSRF protection
export function withCSRFProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const method = req.method;
    const sessionId = req.cookies.get('sessionId')?.value || 'anonymous';
    
    // Only protect state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = req.headers.get('X-CSRF-Token');
      
      if (!csrfToken || !validateCSRFToken(sessionId, csrfToken)) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'CSRF token validation failed',
            code: 'CSRF_ERROR' 
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    return handler(req);
  };
}

// Generate and send CSRF token in cookie
export function setCSRFCookie(res: NextResponse, sessionId: string): void {
  const token = generateCSRFToken();
  storeCSRFToken(sessionId, token);
  
  res.cookies.set('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_EXPIRATION / 1000
  });
}

