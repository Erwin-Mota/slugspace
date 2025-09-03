import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  getPaginationParams, 
  createResponse, 
  createErrorResponse,
  trackAnalytics,
  getAuthenticatedUser
} from '@/lib/api/utils';

// GET /api/v1/colleges - Get all colleges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(request);
    
    // Get query parameters
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Build where clause
    const where: any = {};
    
    // Add search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    // Get colleges with pagination
    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.college.count({ where }),
    ]);
    
    // Track analytics
    const user = await getAuthenticatedUser();
    if (user) {
      await trackAnalytics('page_view', { page: 'colleges', search }, user.id);
    }
    
    return createResponse({
      colleges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Colleges API error:', error);
    return createErrorResponse('Failed to fetch colleges', 500);
  }
}
