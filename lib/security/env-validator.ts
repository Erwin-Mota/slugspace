// 🔐 Environment Variable Validation
// Fails fast at startup if critical environment variables are missing or invalid

import { z } from 'zod';

const envSchema = z.object({
  // Core Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'Secret must be at least 32 characters'),
  
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  
  // OAuth Providers
  GITHUB_ID: z.string().min(1).optional(),
  GITHUB_SECRET: z.string().min(1).optional(),
  GOOGLE_ID: z.string().min(1).optional(),
  GOOGLE_SECRET: z.string().min(1).optional(),
  
  // Redis (optional in development)
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // Analytics & Monitoring (optional)
  SENTRY_DSN: z.string().url().optional(),
});

type EnvType = z.infer<typeof envSchema>;

// Validate environment variables
export function validateEnvironment(): EnvType {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment configuration. See errors above.');
    }
    throw error;
  }
}

// Validate on import
let validatedEnv: EnvType | null = null;

export function getEnv(): EnvType {
  if (!validatedEnv) {
    validatedEnv = validateEnvironment();
  }
  return validatedEnv;
}

// Helper to check if we're in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Helper to check if we're in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Export validated env (use this instead of process.env directly)
export const env = getEnv();

