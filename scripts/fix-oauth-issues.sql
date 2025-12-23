-- Fix potential schema issues for NextAuth OAuth
-- Run this in Supabase SQL Editor if OAuth is still failing

-- Ensure emailVerified column has correct type (with precision)
-- This should already be correct, but let's make sure
DO $$ 
BEGIN
    -- Check if column exists and has correct type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'emailVerified'
        AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE users ALTER COLUMN "emailVerified" TYPE TIMESTAMP(6);
    END IF;
END $$;

-- Verify all required columns exist in users table
DO $$
BEGIN
    -- Add interests column if missing (should already exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'interests'
    ) THEN
        ALTER TABLE users ADD COLUMN interests TEXT[];
    END IF;
    
    -- Add role column if missing (should already exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';
    END IF;
    
    -- Add major column if missing (should already exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'major'
    ) THEN
        ALTER TABLE users ADD COLUMN major TEXT;
    END IF;
    
    -- Add year column if missing (should already exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'year'
    ) THEN
        ALTER TABLE users ADD COLUMN year TEXT;
    END IF;
    
    -- Add college column if missing (should already exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'college'
    ) THEN
        ALTER TABLE users ADD COLUMN college TEXT;
    END IF;
END $$;

-- Verify all required indexes exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Check accounts table structure
DO $$
BEGIN
    -- Ensure all required columns exist in accounts table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'session_state'
    ) THEN
        ALTER TABLE accounts ADD COLUMN session_state TEXT;
    END IF;
END $$;

