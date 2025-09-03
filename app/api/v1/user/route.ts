import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createResponse, 
  createErrorResponse,
  getAuthenticatedUser
} from '@/lib/api/utils';

// GET /api/v1/user - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    // Get user with all related data
    const userWithData = await prisma.user.findUnique({
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
    });
    
    return createResponse(userWithData);
    
  } catch (error) {
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
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(major && { major }),
        ...(year && { year }),
        ...(interests && { interests }),
        ...(college && { college }),
        updatedAt: new Date(),
      },
    });
    
    return createResponse(updatedUser);
    
  } catch (error) {
    console.error('Update user error:', error);
    return createErrorResponse('Failed to update user', 500);
  }
}
