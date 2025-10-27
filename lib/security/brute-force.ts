// 🚫 Brute Force Protection System
// Protects authentication endpoints from brute force attacks

const failedAttempts = new Map<string, { count: number; resetTime: number }>();
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export interface BruteForceCheckResult {
  allowed: boolean;
  attemptsRemaining: number;
  resetTime: number | null;
}

// Check if IP is blocked due to brute force
export function checkBruteForce(identifier: string): BruteForceCheckResult {
  const record = failedAttempts.get(identifier);
  
  if (!record) {
    return {
      allowed: true,
      attemptsRemaining: MAX_ATTEMPTS,
      resetTime: null
    };
  }
  
  const now = Date.now();
  
  // If still within block period
  if (now < record.resetTime) {
    return {
      allowed: false,
      attemptsRemaining: 0,
      resetTime: record.resetTime
    };
  }
  
  // Block period expired, reset
  failedAttempts.delete(identifier);
  return {
    allowed: true,
    attemptsRemaining: MAX_ATTEMPTS - record.count,
    resetTime: null
  };
}

// Record a failed login attempt
export function recordFailedAttempt(identifier: string): BruteForceCheckResult {
  const record = failedAttempts.get(identifier);
  
  if (!record) {
    failedAttempts.set(identifier, {
      count: 1,
      resetTime: Date.now() + BLOCK_DURATION
    });
    
    return {
      allowed: true,
      attemptsRemaining: MAX_ATTEMPTS - 1,
      resetTime: Date.now() + BLOCK_DURATION
    };
  }
  
  // Increment attempt count
  record.count++;
  
  // Block if max attempts reached
  if (record.count >= MAX_ATTEMPTS) {
    record.resetTime = Date.now() + BLOCK_DURATION;
    
    console.error(`🚫 IP blocked for brute force: ${identifier}`, {
      attempts: record.count,
      blockedUntil: new Date(record.resetTime).toISOString()
    });
    
    return {
      allowed: false,
      attemptsRemaining: 0,
      resetTime: record.resetTime
    };
  }
  
  failedAttempts.set(identifier, record);
  
  return {
    allowed: true,
    attemptsRemaining: MAX_ATTEMPTS - record.count,
    resetTime: record.resetTime
  };
}

// Record successful login (reset attempt counter)
export function recordSuccessfulLogin(identifier: string): void {
  failedAttempts.delete(identifier);
}

// Get IP address from request
export function getClientIdentifier(req: any): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
  return ip;
}

// Middleware wrapper for brute force protection
export function withBruteForceProtection(
  handler: (req: any) => Promise<Response>,
  identifierExtractor: (req: any) => string = getClientIdentifier
) {
  return async (req: any): Promise<Response> => {
    const identifier = identifierExtractor(req);
    
    // Check if IP is currently blocked
    const check = checkBruteForce(identifier);
    
    if (!check.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many failed attempts. Please try again later.',
          retryAfter: Math.ceil((check.resetTime! - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((check.resetTime! - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    return handler(req);
  };
}

// Cleanup expired blocks (run periodically)
export function cleanupExpiredBlocks(): void {
  const now = Date.now();
  for (const [key, record] of failedAttempts.entries()) {
    if (now > record.resetTime) {
      failedAttempts.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredBlocks, 5 * 60 * 1000);

