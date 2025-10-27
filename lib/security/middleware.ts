import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { rateLimitStore } from './rate-limiter';
import { sanitizeInput } from './sanitizer';
import { auditLog } from './audit-logger';

// 🛡️ Security Middleware for SlugConnect
// Comprehensive security layer for all API endpoints

// 🔐 Security Headers Middleware
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
  };
}

// 🚫 Rate Limiting Middleware
export async function rateLimitMiddleware(
  request: NextRequest,
  options: {
    windowMs?: number;
    maxRequests?: number;
    identifier?: string;
  } = {}
): Promise<NextResponse | null> {
  const { windowMs = 60000, maxRequests = 100, identifier } = options;
  
  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  const clientId = identifier || ip;
  
  // Check rate limit
  const isAllowed = rateLimitStore.checkRateLimit(clientId, windowMs, maxRequests);
  
  if (!isAllowed) {
    await auditLog('RATE_LIMIT_EXCEEDED', {
      ip,
      userAgent: request.headers.get('user-agent'),
      endpoint: request.nextUrl.pathname,
      method: request.method,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(windowMs / 1000).toString(),
          ...securityHeaders()
        }
      }
    );
  }
  
  return null;
}

// 🔍 Input Sanitization Middleware
export async function sanitizationMiddleware(request: NextRequest): Promise<NextRequest> {
  const url = new URL(request.url);
  
  // Sanitize query parameters
  for (const [key, value] of url.searchParams.entries()) {
    const sanitized = sanitizeInput(value);
    if (sanitized !== value) {
      url.searchParams.set(key, sanitized);
    }
  }
  
  // For POST/PUT requests, sanitize body
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.json();
      const sanitizedBody = sanitizeObject(body);
      
      // Create new request with sanitized data
      const sanitizedRequest = new NextRequest(url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(sanitizedBody),
      });
      
      return sanitizedRequest;
    } catch (error) {
      // If JSON parsing fails, return original request
      return request;
    }
  }
  
  return new NextRequest(url, request);
}

// 🛡️ Authentication Middleware
export async function authMiddleware(
  request: NextRequest,
  options: {
    required?: boolean;
    roles?: string[];
  } = {}
): Promise<{ user: any; error?: NextResponse }> {
  const { required = false, roles = [] } = options;
  
  try {
    // Get session from NextAuth
    const session = await getServerSession(request);
    
    if (required && !session) {
      return {
        user: null,
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          },
          { 
            status: 401,
            headers: securityHeaders()
          }
        )
      };
    }
    
    if (session && roles.length > 0) {
      const userRoles = session.user?.roles || [];
      const hasRequiredRole = roles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        return {
          user: session.user,
          error: NextResponse.json(
            { 
              success: false, 
              error: 'Insufficient permissions',
              code: 'INSUFFICIENT_PERMISSIONS'
            },
            { 
              status: 403,
              headers: securityHeaders()
            }
          )
        };
      }
    }
    
    return { user: session?.user || null };
  } catch (error) {
    if (required) {
      return {
        user: null,
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Authentication failed',
            code: 'AUTH_FAILED'
          },
          { 
            status: 401,
            headers: securityHeaders()
          }
        )
      };
    }
    
    return { user: null };
  }
}

// 🔒 CSRF Protection Middleware
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip CSRF for GET requests
  if (request.method === 'GET') {
    return null;
  }
  
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  // Check if request is from same origin
  if (origin && !origin.includes(host || '')) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'CSRF token validation failed',
        code: 'CSRF_ERROR'
      },
      { 
        status: 403,
        headers: securityHeaders()
      }
    );
  }
  
  return null;
}

// 📏 Request Size Limiting Middleware
export function requestSizeMiddleware(
  request: NextRequest,
  maxSize: number = 1024 * 1024 // 1MB default
): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Request payload too large',
        code: 'PAYLOAD_TOO_LARGE'
      },
      { 
        status: 413,
        headers: securityHeaders()
      }
    );
  }
  
  return null;
}

// 🚫 IP Whitelist Middleware (for admin endpoints)
export function ipWhitelistMiddleware(
  request: NextRequest,
  allowedIPs: string[] = []
): NextResponse | null {
  if (allowedIPs.length === 0) {
    return null; // No whitelist configured
  }
  
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  
  if (!allowedIPs.includes(ip)) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Access denied from this IP',
        code: 'IP_NOT_ALLOWED'
      },
      { 
        status: 403,
        headers: securityHeaders()
      }
    );
  }
  
  return null;
}

// 🔍 Security Audit Middleware
export async function auditMiddleware(
  request: NextRequest,
  response: NextResponse,
  userId?: string
): Promise<void> {
  const endpoint = request.nextUrl.pathname;
  const method = request.method;
  const userAgent = request.headers.get('user-agent');
  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  
  await auditLog('API_REQUEST', {
    endpoint,
    method,
    userId,
    ip,
    userAgent,
    statusCode: response.status,
    timestamp: new Date().toISOString(),
  });
}

// 🛡️ Comprehensive Security Wrapper
export async function withSecurity<T>(
  request: NextRequest,
  handler: (req: NextRequest, user?: any) => Promise<NextResponse<T>>,
  options: {
    auth?: { required: boolean; roles?: string[] };
    rateLimit?: { windowMs?: number; maxRequests?: number };
    csrf?: boolean;
    maxSize?: number;
    allowedIPs?: string[];
  } = {}
): Promise<NextResponse<T>> {
  const {
    auth = { required: false },
    rateLimit = { windowMs: 60000, maxRequests: 100 },
    csrf = true,
    maxSize = 1024 * 1024,
    allowedIPs = []
  } = options;
  
  try {
    // 1. Request size check
    const sizeCheck = requestSizeMiddleware(request, maxSize);
    if (sizeCheck) return sizeCheck;
    
    // 2. IP whitelist check
    const ipCheck = ipWhitelistMiddleware(request, allowedIPs);
    if (ipCheck) return ipCheck;
    
    // 3. CSRF protection
    if (csrf) {
      const csrfCheck = csrfMiddleware(request);
      if (csrfCheck) return csrfCheck;
    }
    
    // 4. Rate limiting
    const rateLimitCheck = await rateLimitMiddleware(request, rateLimit);
    if (rateLimitCheck) return rateLimitCheck;
    
    // 5. Input sanitization
    const sanitizedRequest = await sanitizationMiddleware(request);
    
    // 6. Authentication
    const { user, error: authError } = await authMiddleware(sanitizedRequest, auth);
    if (authError) return authError;
    
    // 7. Execute handler
    const response = await handler(sanitizedRequest, user);
    
    // 8. Add security headers
    Object.entries(securityHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // 9. Audit logging
    await auditMiddleware(request, response, user?.id);
    
    return response;
  } catch (error) {
    console.error('Security middleware error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { 
        status: 500,
        headers: securityHeaders()
      }
    );
  }
}

// Helper function to get server session (placeholder)
async function getServerSession(request: NextRequest): Promise<any> {
  // This would integrate with NextAuth's getServerSession
  // For now, return null to indicate no authentication
  return null;
}

// Helper function to sanitize objects recursively
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}
