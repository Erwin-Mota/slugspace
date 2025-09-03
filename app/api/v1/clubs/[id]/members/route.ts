import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createResponse, 
  createErrorResponse,
  getAuthenticatedUser,
  trackAnalytics
} from '@/lib/api/utils';

// POST /api/v1/clubs/[id]/members - Join a club
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    const clubId = params.id;
    
    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });
    
    if (!club) {
      return createErrorResponse('Club not found', 404);
    }
    
    // Check if user is already a member
    const existingMembership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId: clubId,
        },
      },
    });
    
    if (existingMembership) {
      return createErrorResponse('Already a member of this club', 400);
    }
    
    // Join the club
    const membership = await prisma.clubMember.create({
      data: {
        userId: user.id,
        clubId: clubId,
        role: 'member',
      },
    });
    
    // Update club member count
    await prisma.club.update({
      where: { id: clubId },
      data: {
        memberCount: { increment: 1 },
      },
    });
    
    // Track analytics
    await trackAnalytics('club_join', { clubId }, user.id);
    
    return createResponse(membership, 201);
    
  } catch (error) {
    console.error('Join club error:', error);
    return createErrorResponse('Failed to join club', 500);
  }
}

// DELETE /api/v1/clubs/[id]/members - Leave a club
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    const clubId = params.id;
    
    // Check if user is a member
    const membership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId: clubId,
        },
      },
    });
    
    if (!membership) {
      return createErrorResponse('Not a member of this club', 400);
    }
    
    // Leave the club
    await prisma.clubMember.delete({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId: clubId,
        },
      },
    });
    
    // Update club member count
    await prisma.club.update({
      where: { id: clubId },
      data: {
        memberCount: { decrement: 1 },
      },
    });
    
    return createResponse({ message: 'Successfully left club' });
    
  } catch (error) {
    console.error('Leave club error:', error);
    return createErrorResponse('Failed to leave club', 500);
  }
}

// GET /api/v1/clubs/[id]/members - Get club members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clubId = params.id;
    
    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });
    
    if (!club) {
      return createErrorResponse('Club not found', 404);
    }
    
    // Get club members
    const members = await prisma.clubMember.findMany({
      where: { clubId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            major: true,
            year: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
    
    return createResponse({ members });
    
  } catch (error) {
    console.error('Get club members error:', error);
    return createErrorResponse('Failed to fetch club members', 500);
  }
}
