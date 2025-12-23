import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createResponse, 
  createErrorResponse,
  getAuthenticatedUser,
  handleDatabaseError,
  withRetry
} from '@/lib/api/utils';

// GET /api/v1/user - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    // Get user with all related data (with retry)
    const userWithData = await withRetry(() => prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userAnalytics: true,
        clubMemberships: {
          include: {
            club: {
              include: {
                _count: { select: { members: true } },
              },
            },
          },
        },
        studyGroupMemberships: {
          include: {
            course: {
              include: {
                _count: { select: { studyGroups: true } },
              },
            },
          },
        },
      },
    }));
    
    return createResponse(userWithData);
    
  } catch (error: any) {
    if (error.code?.startsWith('P')) {
      return handleDatabaseError(error);
    }
    console.error('User API error:', error);
    return createErrorResponse('Failed to fetch user data', 500);
  }
}

// PUT /api/v1/user - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    const body = await request.json();
    const { name, major, year, interests, college } = body;
    
    // Build update data object, only including provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (name !== undefined) updateData.name = name;
    if (major !== undefined) updateData.major = major;
    if (year !== undefined) updateData.year = year;
    if (interests !== undefined) updateData.interests = interests;
    if (college !== undefined) updateData.college = college;
    
    const updatedUser = await withRetry(() => prisma.user.update({
      where: { id: user.id },
      data: updateData,
    }));
    
    return createResponse(updatedUser);
    
  } catch (error: any) {
    console.error('Update user error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });
    
    if (error.code?.startsWith('P')) {
      return handleDatabaseError(error);
    }
    return createErrorResponse(error.message || 'Failed to update user', 500);
  }
}
