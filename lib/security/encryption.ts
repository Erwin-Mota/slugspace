// 🔐 Encryption Utilities
// For sensitive data encryption at rest and in transit

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;

// Generate encryption key from password
export function generateKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

// Encrypt sensitive data
export function encrypt(text: string, secret: string = process.env.ENCRYPTION_KEY || 'default-secret'): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(secret, 'salt', KEY_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return iv + authTag + encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

// Decrypt sensitive data
export function decrypt(encryptedData: string, secret: string = process.env.ENCRYPTION_KEY || 'default-secret'): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const key = crypto.scryptSync(secret, 'salt', KEY_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Hash sensitive data (one-way)
export function hash(text: string): string {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
}

// Generate salt for password hashing
export function generateSalt(): string {
  return crypto.randomBytes(SALT_LENGTH).toString('hex');
}

// Hash password with salt
export function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
}

// Verify password
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashToVerify = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashToVerify));
}

// Encrypt object
export function encryptObject(obj: any): string {
  return encrypt(JSON.stringify(obj));
}

// Decrypt object
export function decryptObject<T = any>(encrypted: string): T {
  return JSON.parse(decrypt(encrypted));
}

