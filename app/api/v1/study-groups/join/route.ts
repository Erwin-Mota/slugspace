import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createResponse, 
  createErrorResponse,
  getAuthenticatedUser,
  trackAnalytics,
  handleDatabaseError,
  withRetry
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
    const currentMemberships = await withRetry(() => prisma.studyGroupMember.count({
      where: { userId: user.id }
    }));

    if (currentMemberships >= 5) {
      return createErrorResponse('You can only join up to 5 study groups', 400);
    }

    // Find or create the course
    let course = await withRetry(() => prisma.course.findUnique({
      where: { code: courseCode }
    }));

    if (!course) {
      // Course doesn't exist in database, create it
      course = await withRetry(() => prisma.course.create({
        data: {
          code: courseCode,
          name: courseCode, // Will be updated when we have full course data
          isActive: true,
        }
      }));
    }

    // Check if user is already a member
    const existingMembership = await withRetry(() => prisma.studyGroupMember.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id
        }
      }
    }));

    if (existingMembership) {
      return createErrorResponse('You are already a member of this study group', 400);
    }

    // Create the membership
    const membership = await withRetry(() => prisma.studyGroupMember.create({
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
    }));

    // Update course student count (non-critical, don't fail if this fails)
    try {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          studentCount: {
            increment: 1
          }
        }
      });
    } catch (updateError) {
      console.error('Failed to update course count:', updateError);
      // Continue anyway
    }

    // Track analytics (non-critical)
    try {
      await trackAnalytics('course_join', { courseCode }, user.id);
    } catch (analyticsError) {
      console.error('Analytics tracking failed:', analyticsError);
      // Continue anyway
    }

    return createResponse({
      membership,
      message: 'Successfully joined study group'
    });

  } catch (error: any) {
    if (error.code?.startsWith('P')) {
      return handleDatabaseError(error);
    }
    console.error('Join study group error:', error);
    return createErrorResponse('Failed to join study group', 500);
  }
}

