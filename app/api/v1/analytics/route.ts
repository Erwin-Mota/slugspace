import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createResponse, 
  createErrorResponse,
  getAuthenticatedUser,
  handleDatabaseError,
  withRetry
} from '@/lib/api/utils';

// GET /api/v1/analytics - Get analytics dashboard data
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401);
    }
    
    // Get overview statistics (with retry for resilience)
    const [
      totalUsers,
      totalClubs,
      totalCourses,
      totalColleges,
      totalClubMemberships,
      totalStudyGroupMemberships,
      recentUsers,
      popularClubs,
      popularCourses,
    ] = await Promise.all([
      withRetry(() => prisma.user.count()),
      withRetry(() => prisma.club.count()),
      withRetry(() => prisma.course.count()),
      withRetry(() => prisma.college.count()),
      withRetry(() => prisma.clubMember.count()),
      withRetry(() => prisma.studyGroupMember.count()),
      withRetry(() => prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })),
      withRetry(() => prisma.club.findMany({
        take: 5,
        orderBy: { memberCount: 'desc' },
        select: {
          id: true,
          name: true,
          memberCount: true,
          category: true,
        },
      })),
      withRetry(() => prisma.course.findMany({
        take: 5,
        orderBy: { studentCount: 'desc' },
        select: {
          id: true,
          code: true,
          name: true,
          studentCount: true,
        },
      })),
    ]);
    
    return createResponse({
      overview: {
        totalUsers,
        totalClubs,
        totalCourses,
        totalColleges,
        totalClubMemberships,
        totalStudyGroupMemberships,
      },
      recentUsers,
      popularClubs,
      popularCourses,
    });
    
  } catch (error: any) {
    if (error.code?.startsWith('P')) {
      return handleDatabaseError(error);
    }
    console.error('Analytics API error:', error);
    return createErrorResponse('Failed to fetch analytics', 500);
  }
}
