import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  getPaginationParams, 
  createResponse, 
  createErrorResponse,
  trackAnalytics,
  getAuthenticatedUser
} from '@/lib/api/utils';

// GET /api/v1/search - Universal search across clubs, courses, and colleges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(request);
    
    const searchTerm = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // clubs, courses, colleges, all
    
    if (!searchTerm) {
      return createErrorResponse('Search term is required', 400);
    }
    
    const results: any = {
      clubs: [],
      courses: [],
      colleges: [],
      total: 0,
    };
    
    // Search clubs
    if (type === 'all' || type === 'clubs') {
      const clubs = await prisma.club.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: type === 'clubs' ? limit : 5,
        include: {
          _count: { select: { members: true } },
        },
      });
      results.clubs = clubs.map(club => ({
        ...club,
        memberCount: club._count.members,
        type: 'club',
      }));
    }
    
    // Search courses
    if (type === 'all' || type === 'courses') {
      const courses = await prisma.course.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { department: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: type === 'courses' ? limit : 5,
        include: {
          _count: { select: { studyGroups: true } },
        },
      });
      results.courses = courses.map(course => ({
        ...course,
        studentCount: course._count.studyGroups,
        type: 'course',
      }));
    }
    
    // Search colleges
    if (type === 'all' || type === 'colleges') {
      const colleges = await prisma.college.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: type === 'colleges' ? limit : 5,
      });
      results.colleges = colleges.map(college => ({
        ...college,
        type: 'college',
      }));
    }
    
    // Calculate total results
    results.total = results.clubs.length + results.courses.length + results.colleges.length;
    
    // Track analytics
    const user = await getAuthenticatedUser();
    if (user) {
      await trackAnalytics('search', {
        searchTerm,
        searchType: type,
        resultsCount: results.total,
      }, user.id);
    }
    
    return createResponse({
      results,
      searchTerm,
      type,
      pagination: {
        page,
        limit,
        total: results.total,
      },
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return createErrorResponse('Failed to perform search', 500);
  }
}
