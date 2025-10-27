// 🛡️ Unified Security Middleware
// Single middleware that applies ALL security checks

import { NextRequest, NextResponse } from 'next/server';
import { comprehensiveSecurityCheck } from './comprehensive-check';
import { validateRequestSize } from '../api/request-limits';
import { withTimeout } from '../api/request-limits';
import { checkBruteForce, recordFailedAttempt } from './brute-force';
import { sanitizeInput } from './sanitizer';

export interface SecurityMiddlewareConfig {
  enableBruteForceCheck?: boolean;
  enableSizeValidation?: boolean;
  enableTimeoutProtection?: boolean;
  enableInputSanitization?: boolean;
  timeoutMs?: number;
  maxRequestSize?: number;
}

const defaultConfig: SecurityMiddlewareConfig = {
  enableBruteForceCheck: true,
  enableSizeValidation: true,
  enableTimeoutProtection: true,
  enableInputSanitization: true,
  timeoutMs: 5000,
  maxRequestSize: 10 * 1024, // 10KB
};

// Main security middleware
export function withSecurityCheck(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: SecurityMiddlewareConfig = {}
) {
  const finalConfig = { ...defaultConfig, ...config };
  
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.ip || 
                 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      
      // 1. Brute Force Check
      if (finalConfig.enableBruteForceCheck && req.method === 'POST') {
        const bruteCheck = checkBruteForce(ip);
        if (!bruteCheck.allowed) {
          console.error('🚫 Blocked brute force attempt:', ip);
          return new NextResponse(
            JSON.stringify({
              error: 'Too many failed attempts. Please try again later.',
              retryAfter: Math.ceil((bruteCheck.resetTime! - Date.now()) / 1000)
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((bruteCheck.resetTime! - Date.now()) / 1000).toString()
              }
            }
          );
        }
      }
      
      // 2. Request Size Validation
      if (finalConfig.enableSizeValidation) {
        try {
          validateRequestSize(req, finalConfig.maxRequestSize);
        } catch (error: any) {
          console.error('🚫 Request too large:', error.message);
          return new NextResponse(
            JSON.stringify({
              error: 'Request size exceeds maximum allowed',
              maxSize: finalConfig.maxRequestSize
            }),
            { status: 413, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // 3. Input Sanitization and Security Check
      if (finalConfig.enableInputSanitization) {
        try {
          // Read body for security check
          const body = await req.clone().json().catch(() => ({}));
          const bodyString = JSON.stringify(body);
          
          // Comprehensive security check
          const securityCheck = comprehensiveSecurityCheck(bodyString);
          
          if (!securityCheck.safe) {
            console.error('🚨 Security threat detected:', {
              threats: securityCheck.threats,
              severity: securityCheck.severity,
              ip,
              endpoint: req.url,
              recommendations: securityCheck.recommendations
            });
            
            // Record failed attempt
            if (securityCheck.severity === 'CRITICAL' || securityCheck.severity === 'HIGH') {
              recordFailedAttempt(ip);
            }
            
            if (securityCheck.severity === 'CRITICAL') {
              return new NextResponse(
                JSON.stringify({
                  error: 'Security validation failed',
                  code: 'SECURITY_VIOLATION',
                  blocked: true
                }),
                {
                  status: 403,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
          }
          
          // Sanitize input
          const sanitizedBody = sanitizeInput(body);
          
          // Create new request with sanitized body
          const newReq = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(sanitizedBody),
          });
          
          // Continue with timeout protection
          if (finalConfig.enableTimeoutProtection) {
            const response = await withTimeout(
              handler(newReq),
              finalConfig.timeoutMs!
            );
            return response;
          }
          
          return handler(newReq);
          
        } catch (error) {
          // If body reading fails, continue without sanitization
          console.warn('Could not sanitize request body, proceeding...');
        }
      }
      
      // 4. Timeout Protection
      if (finalConfig.enableTimeoutProtection) {
        const response = await withTimeout(
          handler(req),
          finalConfig.timeoutMs!
        );
        return response;
      }
      
      return handler(req);
      
    } catch (error: any) {
      console.error('Security middleware error:', error);
      
      // Return generic error to avoid leaking info
      return new NextResponse(
        JSON.stringify({
          error: 'Request processing failed',
          code: 'PROCESSING_ERROR'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

// Convenience wrappers for different security levels
export const withStandardSecurity = (handler: (req: NextRequest) => Promise<NextResponse>) =>
  withSecurityCheck(handler, defaultConfig);

export const withStrictSecurity = (handler: (req: NextRequest) => Promise<NextResponse>) =>
  withSecurityCheck(handler, {
    ...defaultConfig,
    timeoutMs: 3000,
    maxRequestSize: 5 * 1024,
  });

export const withRelaxedSecurity = (handler: (req: NextRequest) => Promise<NextResponse>) =>
  withSecurityCheck(handler, {
    enableBruteForceCheck: false,
    enableSizeValidation: false,
    enableTimeoutProtection: true,
    enableInputSanitization: true,
  });

