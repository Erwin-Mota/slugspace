import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createResponse, 
  createErrorResponse,
  getAuthenticatedUser
} from '@/lib/api/utils';

// GET /api/v1/study-groups/members?courseCode=XXX - Get all members of a study group
export async function GET(request: NextRequest) {
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
      return createResponse({ members: [] });
    }

    // Get all members
    const members = await prisma.studyGroupMember.findMany({
      where: {
        courseId: course.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    });

    // Return only email addresses (as requested)
    const memberEmails = members.map(m => ({
      email: m.user.email,
      name: m.user.name,
      joinedAt: m.joinedAt
    }));

    return createResponse({
      members: memberEmails,
      count: memberEmails.length
    });

  } catch (error) {
    console.error('Get study group members error:', error);
    return createErrorResponse('Failed to fetch study group members', 500);
  }
}

