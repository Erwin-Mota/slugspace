import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  getPaginationParams, 
  buildSearchQuery, 
  createResponse, 
  createErrorResponse,
  trackAnalytics,
  getAuthenticatedUser,
  handleDatabaseError,
  withRetry
} from '@/lib/api/utils';

// GET /api/v1/courses - Get all courses with search, filter, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(request);
    
    // Get query parameters
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Build where clause
    const where: any = {
      isActive: true,
    };
    
    // Add search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Add department filter
    if (department) {
      where.department = department;
    }
    
    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    // Get courses with pagination (with retry)
    const [courses, total] = await Promise.all([
      withRetry(() => prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          courseAnalytics: true,
          _count: {
            select: { studyGroups: true },
          },
        },
      })),
      withRetry(() => prisma.course.count({ where })),
    ]);
    
    // Track analytics
    const user = await getAuthenticatedUser();
    if (user) {
      await trackAnalytics('page_view', { page: 'courses', search, department }, user.id);
    }
    
    return createResponse({
      courses: courses.map(course => ({
        ...course,
        studentCount: course._count.studyGroups,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error: any) {
    if (error.code?.startsWith('P')) {
      return handleDatabaseError(error);
    }
    console.error('Courses API error:', error);
    return createErrorResponse('Failed to fetch courses', 500);
  }
}

// POST /api/v1/courses - Create a new course (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401);
    }
    
    const body = await request.json();
    const { code, name, description, department, units, prerequisites } = body;
    
    if (!code || !name || !description || !department) {
      return createErrorResponse('Missing required fields', 400);
    }
    
    const course = await withRetry(() => prisma.course.create({
      data: {
        code,
        name,
        description,
        department,
        units: units || 0,
        prerequisites: prerequisites || [],
      },
    }));
    
    // Create analytics entry (non-critical)
    try {
      await prisma.courseAnalytics.create({
        data: { courseId: course.id },
      });
    } catch (analyticsError) {
      console.error('Analytics creation failed:', analyticsError);
      // Continue anyway
    }
    
    return createResponse(course, 201);
    
  } catch (error: any) {
    if (error.code?.startsWith('P')) {
      return handleDatabaseError(error);
    }
    console.error('Create course error:', error);
    return createErrorResponse('Failed to create course', 500);
  }
}
