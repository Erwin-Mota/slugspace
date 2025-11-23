import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Get authenticated user from session
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  
  return await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userAnalytics: true,
    },
  });
}

// Standard API response helper
export function createResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Error response helper
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Pagination helper
export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

// Search helper
export function buildSearchQuery(searchTerm: string, fields: string[]) {
  if (!searchTerm) return {};
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    })),
  };
}

// Analytics tracking
export async function trackAnalytics(
  type: 'page_view' | 'search' | 'club_join' | 'course_join',
  data: any,
  userId?: string
) {
  try {
    switch (type) {
      case 'page_view':
        if (userId) {
          await prisma.userAnalytics.upsert({
            where: { userId },
            update: { pageViews: { increment: 1 } },
            create: { userId, pageViews: 1 },
          });
        }
        break;
        
      case 'search':
        await prisma.searchAnalytics.create({
          data: {
            searchTerm: data.searchTerm,
            searchType: data.searchType,
            resultsCount: data.resultsCount,
            userId,
          },
        });
        break;
        
      case 'club_join':
        if (userId) {
          await prisma.userAnalytics.upsert({
            where: { userId },
            update: { clubJoins: { increment: 1 } },
            create: { userId, clubJoins: 1 },
          });
        }
        break;
        
      case 'course_join':
        if (userId) {
          await prisma.userAnalytics.upsert({
            where: { userId },
            update: { studyGroupJoins: { increment: 1 } },
            create: { userId, studyGroupJoins: 1 },
          });
        }
        break;
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

// Input validation
export function validateInput(data: any, requiredFields: string[]) {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  return true;
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000) {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}
