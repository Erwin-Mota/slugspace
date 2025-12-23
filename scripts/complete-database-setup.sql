-- Complete Database Setup for SlugSpace
-- Run this in Supabase SQL Editor for a fresh database setup
-- This includes all tables and fixes

-- ============================================
-- NEXT-AUTH TABLES (Required for OAuth)
-- ============================================

-- Users table (NextAuth compatible)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP(6),
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

-- ============================================
-- APPLICATION TABLES
-- ============================================

-- Courses table (needed for study groups)
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    units INTEGER,
    prerequisites TEXT[],
    professor TEXT,
    schedule TEXT,
    location TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "studentCount" INTEGER DEFAULT 0,
    "activityScore" FLOAT DEFAULT 0.0
);

-- Study group members table (needed for joining study groups)
CREATE TABLE IF NOT EXISTS study_group_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    "joinedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE("userId", "courseId")
);

-- Clubs table (needed for clubs feature)
CREATE TABLE IF NOT EXISTS clubs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    "meetingTime" TEXT,
    "meetingLocation" TEXT,
    "contactEmail" TEXT,
    website TEXT,
    instagram TEXT,
    discord TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "memberCount" INTEGER DEFAULT 0,
    "popularityScore" FLOAT DEFAULT 0.0
);

-- Club members table (needed for joining clubs)
CREATE TABLE IF NOT EXISTS club_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    "joinedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("clubId") REFERENCES clubs(id) ON DELETE CASCADE,
    UNIQUE("userId", "clubId")
);

-- Colleges table (needed for college finder)
CREATE TABLE IF NOT EXISTS colleges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    "imageUrl" TEXT,
    stereotypes TEXT[],
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "popularityScore" FLOAT DEFAULT 0.0
);

-- ============================================
-- ANALYTICS TABLES (Optional but referenced)
-- ============================================

CREATE TABLE IF NOT EXISTS user_analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL,
    "loginCount" INTEGER DEFAULT 0,
    "lastLoginAt" TIMESTAMP,
    "pageViews" INTEGER DEFAULT 0,
    "searchCount" INTEGER DEFAULT 0,
    "clubJoins" INTEGER DEFAULT 0,
    "studyGroupJoins" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS club_analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "clubId" TEXT UNIQUE NOT NULL,
    "viewCount" INTEGER DEFAULT 0,
    "joinCount" INTEGER DEFAULT 0,
    "searchCount" INTEGER DEFAULT 0,
    "lastViewedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("clubId") REFERENCES clubs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "courseId" TEXT UNIQUE NOT NULL,
    "viewCount" INTEGER DEFAULT 0,
    "joinCount" INTEGER DEFAULT 0,
    "searchCount" INTEGER DEFAULT 0,
    "lastViewedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "searchTerm" TEXT NOT NULL,
    "searchType" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendation_analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "recommendationCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);
CREATE INDEX IF NOT EXISTS idx_clubs_category ON clubs(category);
CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name);

-- ============================================
-- SCHEMA FIXES (Safe to run on existing tables)
-- ============================================

-- Ensure emailVerified has correct precision
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'emailVerified'
        AND data_type != 'timestamp without time zone'
    ) THEN
        ALTER TABLE users ALTER COLUMN "emailVerified" TYPE TIMESTAMP(6);
    END IF;
END $$;

-- Ensure all required columns exist in users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'interests'
    ) THEN
        ALTER TABLE users ADD COLUMN interests TEXT[];
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'major'
    ) THEN
        ALTER TABLE users ADD COLUMN major TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'year'
    ) THEN
        ALTER TABLE users ADD COLUMN year TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'college'
    ) THEN
        ALTER TABLE users ADD COLUMN college TEXT;
    END IF;
END $$;

-- Ensure session_state column exists in accounts table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'session_state'
    ) THEN
        ALTER TABLE accounts ADD COLUMN session_state TEXT;
    END IF;
END $$;

