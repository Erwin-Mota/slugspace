import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createResponse, 
  createErrorResponse,
  getAuthenticatedUser,
  trackAnalytics
} from '@/lib/api/utils';

// POST /api/v1/study-groups/join - Join a study group
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { courseCode } = body;

    if (!courseCode) {
      return createErrorResponse('Course code is required', 400);
    }

    // Check if user has already joined 5 study groups
    const currentMemberships = await prisma.studyGroupMember.count({
      where: { userId: user.id }
    });

    if (currentMemberships >= 5) {
      return createErrorResponse('You can only join up to 5 study groups', 400);
    }

    // Find or create the course
    let course = await prisma.course.findUnique({
      where: { code: courseCode }
    });

    if (!course) {
      // Course doesn't exist in database, create it
      // We'll need basic info - for now just create with code
      course = await prisma.course.create({
        data: {
          code: courseCode,
          name: courseCode, // Will be updated when we have full course data
          isActive: true,
        }
      });
    }

    // Check if user is already a member
    const existingMembership = await prisma.studyGroupMember.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id
        }
      }
    });

    if (existingMembership) {
      return createErrorResponse('You are already a member of this study group', 400);
    }

    // Create the membership
    const membership = await prisma.studyGroupMember.create({
      data: {
        userId: user.id,
        courseId: course.id,
        role: 'member',
      },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    // Update course student count
    await prisma.course.update({
      where: { id: course.id },
      data: {
        studentCount: {
          increment: 1
        }
      }
    });

    // Track analytics
    await trackAnalytics('course_join', { courseCode }, user.id);

    return createResponse({
      membership,
      message: 'Successfully joined study group'
    });

  } catch (error: any) {
    console.error('Join study group error:', error);
    if (error.code === 'P2002') {
      return createErrorResponse('You are already a member of this study group', 400);
    }
    return createErrorResponse('Failed to join study group', 500);
  }
}

