import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createResponse, 
  createErrorResponse,
  getAuthenticatedUser
} from '@/lib/api/utils';

// GET /api/v1/analytics - Get analytics dashboard data
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401);
    }
    
    // Get overview statistics
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
      prisma.user.count(),
      prisma.club.count(),
      prisma.course.count(),
      prisma.college.count(),
      prisma.clubMember.count(),
      prisma.studyGroupMember.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.club.findMany({
        take: 5,
        orderBy: { memberCount: 'desc' },
        select: {
          id: true,
          name: true,
          memberCount: true,
          category: true,
        },
      }),
      prisma.course.findMany({
        take: 5,
        orderBy: { studentCount: 'desc' },
        select: {
          id: true,
          code: true,
          name: true,
          studentCount: true,
        },
      }),
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
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return createErrorResponse('Failed to fetch analytics', 500);
  }
}
