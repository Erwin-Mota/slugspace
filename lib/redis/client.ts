import Redis from 'ioredis';

// 🚀 Redis Client Configuration for SlugSpace
// Provides high-performance caching and session storage

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    // Check if Redis URL is provided (for production)
    const redisUrl = process.env.REDIS_URL;
    
    if (redisUrl) {
      // Production Redis (Railway, Heroku, etc.)
      redis = new Redis(redisUrl as string, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    } else {
      // Development Redis (local)
      redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    }

    // Handle connection events
    redis.on('connect', () => {
      console.log('🚀 Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    redis.on('ready', () => {
      console.log('✅ Redis is ready to accept commands');
    });
  }

  return redis;
}

// 🎯 Cache utility functions
export const cache = {
  // Set cache with TTL (Time To Live)
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  },

  // Get cache value
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  },

  // Delete cache key
  async del(key: string): Promise<void> {
    const client = getRedisClient();
    await client.del(key);
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  },

  // Increment counter
  async incr(key: string): Promise<number> {
    const client = getRedisClient();
    return await client.incr(key);
  },

  // Set expiration
  async expire(key: string, seconds: number): Promise<void> {
    const client = getRedisClient();
    await client.expire(key, seconds);
  },

  // Get multiple keys
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const client = getRedisClient();
    const values = await client.mget(...keys);
    return values.map(value => value ? JSON.parse(value) : null);
  },

  // Set multiple keys
  async mset(keyValuePairs: Record<string, any>, ttlSeconds: number = 3600): Promise<void> {
    const client = getRedisClient();
    const pipeline = client.pipeline();
    
    Object.entries(keyValuePairs).forEach(([key, value]) => {
      pipeline.setex(key, ttlSeconds, JSON.stringify(value));
    });
    
    await pipeline.exec();
  }
};

// 🔍 Search cache utilities
export const searchCache = {
  // Cache search results
  async cacheResults(searchTerm: string, searchType: string, results: any[]): Promise<void> {
    const key = `search:${searchType}:${searchTerm.toLowerCase()}`;
    await cache.set(key, results, 1800); // 30 minutes
  },

  // Get cached search results
  async getCachedResults<T>(searchTerm: string, searchType: string): Promise<T[] | null> {
    const key = `search:${searchType}:${searchTerm.toLowerCase()}`;
    return await cache.get<T[]>(key);
  }
};

// 📊 Analytics cache utilities
export const analyticsCache = {
  // Cache user analytics
  async cacheUserAnalytics(userId: string, analytics: any): Promise<void> {
    const key = `analytics:user:${userId}`;
    await cache.set(key, analytics, 7200); // 2 hours
  },

  // Get cached user analytics
  async getUserAnalytics(userId: string): Promise<any | null> {
    const key = `analytics:user:${userId}`;
    return await cache.get(key);
  },

  // Cache club analytics
  async cacheClubAnalytics(clubId: string, analytics: any): Promise<void> {
    const key = `analytics:club:${clubId}`;
    await cache.set(key, analytics, 3600); // 1 hour
  },

  // Get cached club analytics
  async getClubAnalytics(clubId: string): Promise<any | null> {
    const key = `analytics:club:${clubId}`;
    return await cache.get(key);
  }
};

export default redis;
