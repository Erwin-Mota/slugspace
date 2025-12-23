-- Create all tables needed for SlugSpace
-- Run this in Supabase SQL Editor AFTER running create-nextauth-tables.sql

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

-- Analytics tables (optional but referenced in schema)
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);
CREATE INDEX IF NOT EXISTS idx_clubs_category ON clubs(category);
CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name);

