-- Migration script to preserve existing data and create new schema
-- This script will:
-- 1. Create new tables with NextAuth compatibility
-- 2. Migrate existing data to new schema
-- 3. Preserve all existing data

-- First, let's create the new tables alongside the old ones

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

-- NextAuth required tables
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

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    expires TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verificationtokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    UNIQUE(identifier, token)
);

-- Migrate clubs data
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

-- Migrate courses data
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

-- Migrate colleges data
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

-- Relationship tables
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

-- Analytics tables
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

-- Now migrate the existing data

-- Migrate clubs data
INSERT INTO clubs (id, name, description, category, "meetingTime", "contactEmail")
SELECT 
    id,
    name,
    COALESCE(description, ''),
    category,
    "meetingTime",
    "contactInfo"
FROM campus_clubs
ON CONFLICT (id) DO NOTHING;

-- Migrate courses data
INSERT INTO courses (id, code, name, description, units, prerequisites)
SELECT 
    id,
    code,
    name,
    COALESCE(description, ''),
    COALESCE(credits, 0),
    CASE 
        WHEN prerequisites IS NOT NULL AND prerequisites != '' 
        THEN string_to_array(prerequisites, ',')
        ELSE ARRAY[]::TEXT[]
    END
FROM ucsc_courses
ON CONFLICT (code) DO NOTHING;

-- Migrate colleges data
INSERT INTO colleges (id, name, description, "imageUrl", stereotypes)
SELECT 
    id,
    name,
    COALESCE("funFact", ''),
    "imageUrl",
    CASE 
        WHEN stereotype IS NOT NULL AND stereotype != '' 
        THEN ARRAY[stereotype]
        ELSE ARRAY[]::TEXT[]
    END
FROM ucsc_colleges
ON CONFLICT (name) DO NOTHING;

-- Migrate existing club memberships
INSERT INTO club_members ("userId", "clubId", role)
SELECT 
    "userId",
    "clubId",
    COALESCE(role, 'member')
FROM club_crew
ON CONFLICT ("userId", "clubId") DO NOTHING;

-- Migrate existing study group memberships
INSERT INTO study_group_members ("userId", "courseId", role)
SELECT 
    "userId",
    "courseId",
    COALESCE(role, 'member')
FROM study_buddies
ON CONFLICT ("userId", "courseId") DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clubs_category ON clubs(category);
CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_clubs_description_gin ON clubs USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_clubs_name_gin ON clubs USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_courses_description_gin ON courses USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_courses_name_gin ON courses USING gin(to_tsvector('english', name));

-- Update member counts
UPDATE clubs SET "memberCount" = (
    SELECT COUNT(*) FROM club_members WHERE "clubId" = clubs.id
);

UPDATE courses SET "studentCount" = (
    SELECT COUNT(*) FROM study_group_members WHERE "courseId" = courses.id
);

-- Create analytics entries for existing data
INSERT INTO club_analytics ("clubId", "viewCount", "joinCount")
SELECT 
    c.id,
    COALESCE(ci."viewCount", 0),
    COALESCE(ci."joinCount", 0)
FROM clubs c
LEFT JOIN club_insights ci ON c.id = ci."clubId"
ON CONFLICT ("clubId") DO NOTHING;

INSERT INTO course_analytics ("courseId", "viewCount", "joinCount")
SELECT 
    c.id,
    COALESCE(si."viewCount", 0),
    COALESCE(si."joinCount", 0)
FROM courses c
LEFT JOIN study_insights si ON c.id = si."courseId"
ON CONFLICT ("courseId") DO NOTHING;

-- Create user analytics for existing users
INSERT INTO user_analytics ("userId", "loginCount", "pageViews")
SELECT 
    u.id,
    COALESCE(ui."loginCount", 0),
    COALESCE(ui."pageViews", 0)
FROM ucsc_sluggers u
LEFT JOIN user_insights ui ON u.id = ui."userId"
ON CONFLICT ("userId") DO NOTHING;

-- Migrate existing users to new users table
INSERT INTO users (id, name, email, role, major, year, interests, college)
SELECT 
    id,
    name,
    email,
    COALESCE(role, 'student'),
    major,
    year,
    CASE 
        WHEN interests IS NOT NULL AND interests != '' 
        THEN string_to_array(interests, ',')
        ELSE ARRAY[]::TEXT[]
    END,
    college
FROM ucsc_sluggers
ON CONFLICT (email) DO NOTHING;

COMMIT;
