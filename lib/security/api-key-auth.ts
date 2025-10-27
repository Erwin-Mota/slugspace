// 🔑 API Key Authentication
// For external API access and service-to-service communication

import crypto from 'crypto';

// Generate a secure API key
export function generateAPIKey(): string {
  return `sk_${crypto.randomBytes(32).toString('hex')}`;
}

// Hash API key for storage
export function hashAPIKey(apiKey: string): string {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

// Verify API key
export function verifyAPIKey(apiKey: string, hashedKey: string): boolean {
  const hash = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(hashedKey)
  );
}

// API Key permissions
export interface APIKeyPermissions {
  read: boolean;
  write: boolean;
  admin: boolean;
  endpoints: string[]; // Specific endpoints this key can access
}

// Validate API key from request
export function validateAPIKey(req: any): { valid: boolean; permissions?: APIKeyPermissions; keyId?: string } {
  const apiKey = req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return { valid: false };
  }
  
  // In production, check against database
  // For now, return minimal validation
  if (apiKey.startsWith('sk_')) {
    // Basic format validation
    return { 
      valid: true, 
      permissions: {
        read: true,
        write: false,
        admin: false,
        endpoints: ['*']
      }
    };
  }
  
  return { valid: false };
}

// Middleware for API key protection
export function withAPIKeyAuth(handler: (req: any) => Promise<Response>) {
  return async (req: any): Promise<Response> => {
    const validation = validateAPIKey(req);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or missing API key',
          code: 'API_KEY_INVALID' 
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return handler(req);
  };
}

