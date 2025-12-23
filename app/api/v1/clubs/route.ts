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

// GET /api/v1/clubs - Get all clubs with search, filter, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(request);
    
    // Get query parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
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
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Add category filter
    if (category) {
      where.category = category;
    }
    
    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    // Get clubs with pagination (with retry on connection errors)
    const [clubs, total] = await Promise.all([
      withRetry(() => prisma.club.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          clubAnalytics: true,
          _count: {
            select: { members: true },
          },
        },
      })),
      withRetry(() => prisma.club.count({ where })),
    ]);
    
    // Track analytics
    const user = await getAuthenticatedUser();
    if (user) {
      await trackAnalytics('page_view', { page: 'clubs', search, category }, user.id);
    }
    
    return createResponse({
      clubs: clubs.map(club => ({
        ...club,
        memberCount: club._count.members,
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
    console.error('Clubs API error:', error);
    return createErrorResponse('Failed to fetch clubs', 500);
  }
}

// POST /api/v1/clubs - Create a new club (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401);
    }
    
    const body = await request.json();
    const { name, description, category, meetingTime, meetingLocation, contactEmail } = body;
    
    if (!name || !description || !category) {
      return createErrorResponse('Missing required fields', 400);
    }
    
    const club = await withRetry(() => prisma.club.create({
      data: {
        name,
        description,
        category,
        meetingTime,
        meetingLocation,
        contactEmail,
      },
    }));
    
    // Create analytics entry (don't fail if this fails)
    try {
      await prisma.clubAnalytics.create({
        data: { clubId: club.id },
      });
    } catch (analyticsError) {
      console.error('Analytics creation failed:', analyticsError);
      // Continue anyway - analytics is not critical
    }
    
    return createResponse(club, 201);
    
  } catch (error: any) {
    if (error.code?.startsWith('P')) {
      return handleDatabaseError(error);
    }
    console.error('Create club error:', error);
    return createErrorResponse('Failed to create club', 500);
  }
}
