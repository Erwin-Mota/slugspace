-- Create NextAuth required tables for SlugSpace
-- Run this in Supabase SQL Editor

-- Users table (NextAuth compatible)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP,
    image TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    role TEXT DEFAULT 'student',
    major TEXT,
    year TEXT,
    interests TEXT[],
    college TEXT
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- NextAuth Account table
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(provider, "providerAccountId")
);

-- NextAuth Session table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    expires TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- NextAuth VerificationToken table
CREATE TABLE IF NOT EXISTS verificationtokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    UNIQUE(identifier, token)
);

