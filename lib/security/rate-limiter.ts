// 🚫 Rate Limiting System for SlugSpace
// Implements sliding window rate limiting with Redis support

import Redis from 'ioredis';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  windowStart: number;
}

class RateLimitStore {
  private store = new Map<string, RateLimitRecord>();
  private redis: Redis | null = null;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Try to connect to Redis if available
    try {
      const redisUrl = process.env.REDIS_URL;
      if (redisUrl) {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
        });
        console.log('✅ Connected to Redis for rate limiting');
      }
    } catch (error) {
      console.warn('⚠️  Redis not available, using in-memory rate limiting');
    }
    
    // Clean up expired records every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async checkRateLimit(
    identifier: string,
    windowMs: number = 60000,
    maxRequests: number = 100
  ): Promise<boolean> {
    const now = Date.now();
    
    // Use Redis if available
    if (this.redis) {
      try {
        const key = `ratelimit:${identifier}`;
        const current = await this.redis.incr(key);
        
        if (current === 1) {
          await this.redis.expire(key, Math.ceil(windowMs / 1000));
        }
        
        if (current > maxRequests) {
          return false; // Rate limit exceeded
        }
        
        return true;
      } catch (error) {
        console.error('Redis rate limit error, falling back to in-memory:', error);
        // Fall through to in-memory implementation
      }
    }
    
    // In-memory fallback
    const record = this.store.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
        windowStart: now,
      });
      return true;
    }

    if (record.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment counter
    record.count++;
    return true;
  }

  getRemainingRequests(
    identifier: string,
    windowMs: number = 60000,
    maxRequests: number = 100
  ): number {
    const record = this.store.get(identifier);
    
    if (!record || Date.now() > record.resetTime) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.store.get(identifier);
    return record ? record.resetTime : 0;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  // Get rate limit info for headers
  getRateLimitInfo(
    identifier: string,
    windowMs: number = 60000,
    maxRequests: number = 100
  ): {
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
  } {
    const record = this.store.get(identifier);
    const now = Date.now();
    
    if (!record || now > record.resetTime) {
      return {
        limit: maxRequests,
        remaining: maxRequests,
        reset: now + windowMs,
      };
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const reset = record.resetTime;
    const retryAfter = remaining === 0 ? Math.ceil((reset - now) / 1000) : undefined;

    return {
      limit: maxRequests,
      remaining,
      reset,
      retryAfter,
    };
  }

  // Clear all records (for testing)
  clear(): void {
    this.store.clear();
  }

  // Get current store size (for monitoring)
  size(): number {
    return this.store.size;
  }
}

// Export singleton instance
export const rateLimitStore = new RateLimitStore();

// Rate limiting decorator for easy use
export function withRateLimit(
  windowMs: number = 60000,
  maxRequests: number = 100,
  identifier?: string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0]; // Assuming first argument is NextRequest
      const clientId = identifier || getClientIdentifier(request);
      
      const isAllowed = rateLimitStore.checkRateLimit(clientId, windowMs, maxRequests);
      
      if (!isAllowed) {
        const info = rateLimitStore.getRateLimitInfo(clientId, windowMs, maxRequests);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: info.retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': info.limit.toString(),
              'X-RateLimit-Remaining': info.remaining.toString(),
              'X-RateLimit-Reset': info.reset.toString(),
              'Retry-After': info.retryAfter?.toString() || '60',
            },
          }
        );
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Helper function to get client identifier
function getClientIdentifier(request: any): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return ip;
}

// Different rate limits for different endpoint types
export const RATE_LIMITS = {
  // General API endpoints
  GENERAL: { windowMs: 60000, maxRequests: 100 },
  
  // Search endpoints (more restrictive)
  SEARCH: { windowMs: 60000, maxRequests: 30 },
  
  // Authentication endpoints (very restrictive)
  AUTH: { windowMs: 60000, maxRequests: 5 },
  
  // Admin endpoints (very restrictive)
  ADMIN: { windowMs: 60000, maxRequests: 10 },
  
  // Analytics endpoints (moderate)
  ANALYTICS: { windowMs: 60000, maxRequests: 20 },
  
  // File upload endpoints (very restrictive)
  UPLOAD: { windowMs: 300000, maxRequests: 5 }, // 5 requests per 5 minutes
};

export default rateLimitStore;
