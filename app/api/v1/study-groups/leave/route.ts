import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createResponse, 
  createErrorResponse,
  getAuthenticatedUser
} from '@/lib/api/utils';

// DELETE /api/v1/study-groups/leave - Leave a study group
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get('courseCode');

    if (!courseCode) {
      return createErrorResponse('Course code is required', 400);
    }

    // Find the course
    const course = await prisma.course.findUnique({
      where: { code: courseCode }
    });

    if (!course) {
      return createErrorResponse('Course not found', 404);
    }

    // Find and delete the membership
    const membership = await prisma.studyGroupMember.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id
        }
      }
    });

    if (!membership) {
      return createErrorResponse('You are not a member of this study group', 404);
    }

    await prisma.studyGroupMember.delete({
      where: {
        id: membership.id
      }
    });

    // Update course student count
    await prisma.course.update({
      where: { id: course.id },
      data: {
        studentCount: {
          decrement: 1
        }
      }
    });

    return createResponse({
      message: 'Successfully left study group'
    });

  } catch (error) {
    console.error('Leave study group error:', error);
    return createErrorResponse('Failed to leave study group', 500);
  }
}

