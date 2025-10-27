// 🛡️ Request Size and Timeout Limits
// Protects against DoS attacks and long-running queries

import { NextRequest } from 'next/server';

// Maximum request sizes (in bytes)
export const REQUEST_SIZE_LIMITS = {
  JSON: 10 * 1024,           // 10KB for JSON requests
  FORM: 1 * 1024 * 1024,     // 1MB for form data
  MULTIPART: 5 * 1024 * 1024 // 5MB for file uploads
};

// Request timeout limits (in milliseconds)
export const REQUEST_TIMEOUT_LIMITS = {
  DEFAULT: 5000,          // 5 seconds for most requests
  SEARCH: 10000,          // 10 seconds for search
  ANALYTICS: 15000,       // 15 seconds for analytics
  DATABASE_QUERY: 3000,   // 3 seconds for DB queries
};

// Validate request size
export function validateRequestSize(req: NextRequest, maxSize: number = REQUEST_SIZE_LIMITS.JSON): boolean {
  const contentLength = req.headers.get('content-length');
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    throw new Error(`Request too large. Maximum size: ${maxSize} bytes`);
  }
  
  return true;
}

// Add timeout to promise
export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = REQUEST_TIMEOUT_LIMITS.DEFAULT
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ) as Promise<T>
  ]);
}

// Validate request body size before processing
export async function validateRequestBody(req: NextRequest): Promise<any> {
  const contentLength = req.headers.get('content-length');
  const maxSize = REQUEST_SIZE_LIMITS.JSON;
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    throw new Error('Request body too large');
  }
  
  try {
    const body = await req.json();
    return body;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

// Generate request ID for tracking
export function generateRequestId(): string {
  return crypto.randomUUID();
}

// Store request ID in headers
export function addRequestId(req: NextRequest, res: Response): Response {
  const requestId = crypto.randomUUID();
  
  const newHeaders = new Headers(res.headers);
  newHeaders.set('X-Request-ID', requestId);
  
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });
}

