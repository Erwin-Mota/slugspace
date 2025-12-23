import { NextRequest } from 'next/server';
import { 
  createResponse, 
  createErrorResponse
} from '@/lib/api/utils';
import { prisma } from '@/lib/prisma';

// 🎯 GET /api/v1/recommendations - Get personalized recommendations
export async function GET(request: NextRequest) {
  try {
    // Get and validate query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'clubs';
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    
    if (!userId) {
      return createErrorResponse('userId is required', 400);
    }


    // Get user profile for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clubMemberships: {
          include: { club: true }
        },
        studyGroupMemberships: {
          include: { course: true }
        }
      }
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    let recommendations: any[] = [];

    if (type === 'clubs') {
      recommendations = await getClubRecommendations(user, limit);
    } else if (type === 'courses') {
      recommendations = await getCourseRecommendations(user, limit);
    } else if (type === 'colleges') {
      recommendations = await getCollegeRecommendations(user, limit);
    }

    return createResponse(recommendations);

  } catch (error: any) {
    console.error('❌ Error generating recommendations:', error);
    return createErrorResponse(error.message || 'Failed to generate recommendations', 500);
  }
}

// ��️ Club recommendation algorithm
async function getClubRecommendations(user: any, limit: number) {
  // Get clubs user is not already a member of
  const joinedClubIds = user.joinedClubs.map((membership: any) => membership.club.id);
  
  const clubs = await prisma.club.findMany({
    where: {
      id: { notIn: joinedClubIds }
    },
    include: {
      clubAnalytics: true,
      members: {
        take: 5,
        include: {
          user: {
            select: { major: true, year: true, interests: true }
          }
        }
      }
    }
  });

  // Calculate recommendation scores
  const scoredClubs = clubs.map(club => {
    let score = 0;

    // Interest matching
    const userInterests = user.interests || [];
    const clubCategory = club.category.toLowerCase();
    
    // Check if user's interests align with club category
    const interestMatch = userInterests.some((interest: string) =>
      clubCategory.includes(interest.toLowerCase()) ||
      club.name.toLowerCase().includes(interest.toLowerCase())
    );
    
    if (interestMatch) score += 3;

    // Major matching
    const userMajor = user.major?.toLowerCase() || '';
    if (club.name.toLowerCase().includes(userMajor) || 
        club.description?.toLowerCase().includes(userMajor)) {
      score += 2;
    }

    // College matching (same college students often join similar clubs)
    const sameCollegeMembers = (club.members || []).filter((member: any) => 
      member.user?.college === user.college
    ).length;
    score += sameCollegeMembers * 0.1;

    // Popularity boost
    const popularityScore = ((club.clubAnalytics?.joinCount || 0) + (club.clubAnalytics?.viewCount || 0));
    score += popularityScore * 0.2;

    // Activity recency boost
    score += (club.clubAnalytics?.joinCount || 0) * 0.05;

    return {
      ...club,
      recommendationScore: Math.round(score * 100) / 100,
      reasonsToJoin: generateClubReasons(club, user, interestMatch)
    };
  });

  // Sort by score and return top results
  return scoredClubs
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit)
    .map(club => ({
      id: club.id,
      name: club.name,
      category: club.category,
      description: club.description,
      memberCount: (club.members || []).length,
      popularityScore: ((club.clubAnalytics?.joinCount || 0) + (club.clubAnalytics?.viewCount || 0)),
      recommendationScore: club.recommendationScore,
      reasonsToJoin: club.reasonsToJoin,
      type: 'club'
    }));
}

// 📚 Course recommendation algorithm
async function getCourseRecommendations(user: any, limit: number) {
  // Get courses user is not already in study groups for
  const joinedCourseIds = user.studyGroupMemberships?.map((membership: any) => membership.course.id) || [];
  
  const courses = await prisma.course.findMany({
    where: {
      id: { notIn: joinedCourseIds }
    },
    include: {
      courseAnalytics: true,
      studyGroups: {
        take: 5,
        include: {
          user: {
            select: { major: true, year: true }
          }
        }
      }
    }
  });

  // Calculate recommendation scores
  const scoredCourses = courses.map(course => {
    let score = 0;

    // Major matching
    const userMajor = user.major?.toLowerCase() || '';
    if (course.code.toLowerCase().includes(userMajor.substring(0, 3)) ||
        course.name.toLowerCase().includes(userMajor)) {
      score += 4;
    }

    // Activity score boost
    score += ((course.courseAnalytics?.joinCount || 0) + (course.courseAnalytics?.viewCount || 0)) * 0.3;

    // Study group popularity
    score += (course.studyGroups || []).length * 0.1;

    return {
      ...course,
      recommendationScore: Math.round(score * 100) / 100,
      reasonsToJoin: generateCourseReasons(course, user)
    };
  });

  // Sort by score and return top results
  return scoredCourses
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit)
    .map(course => ({
      id: course.id,
      code: course.code,
      name: course.name,
      description: course.description,
      studyGroupCount: (course.studyGroups || []).length,
      activityScore: ((course.courseAnalytics?.joinCount || 0) + (course.courseAnalytics?.viewCount || 0)),
      recommendationScore: course.recommendationScore,
      reasonsToJoin: course.reasonsToJoin,
      type: 'course'
    }));
}

// �� College recommendation algorithm
async function getCollegeRecommendations(user: any, limit: number) {
  const colleges = await prisma.college.findMany();

  // Simple college matching based on user traits
  const scoredColleges = colleges.map(college => {
    let score = 0;
    
    const userInterests = user.personalityTraits?.interests || [];
    const collegeName = college.name.toLowerCase();
    const stereotypes = (college.stereotypes || []).join(' ').toLowerCase();

    // Match interests with college stereotypes
    userInterests.forEach((interest: string) => {
      if (stereotypes.includes(interest.toLowerCase())) {
        score += 2;
      }
    });

    // Major-based matching
    const userMajor = user.major?.toLowerCase() || '';
    if (userMajor.includes('computer') || userMajor.includes('engineering')) {
      if (collegeName.includes('crown') || stereotypes.includes('stem')) {
        score += 3;
      }
    }

    return {
      ...college,
      recommendationScore: Math.round(score * 100) / 100,
      matchingReasons: generateCollegeReasons(college, user)
    };
  });

  return scoredColleges
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit)
    .map(college => ({
      id: college.id,
      name: college.name,
      stereotypes: college.stereotypes,
      recommendationScore: college.recommendationScore,
      matchingReasons: college.matchingReasons,
      type: 'college'
    }));
}

// Helper functions to generate recommendation reasons
function generateClubReasons(club: any, user: any, interestMatch: boolean): string[] {
  const reasons = [];
  
  if (interestMatch) {
    reasons.push('Matches your interests');
  }
  
  if (club.clubAnalytics?.popularityScore && club.clubAnalytics.popularityScore > 5) {
    reasons.push('Popular among students');
  }
  
  if ((club.members || []).length > 20) {
    reasons.push('Active community');
  }
  
  return reasons;
}

function generateCourseReasons(course: any, user: any): string[] {
  const reasons = [];
  
  if ((course.studyGroups || []).length > 3) {
    reasons.push('Active study groups');
  }
  
  if (course.courseAnalytics?.activityScore && course.courseAnalytics.activityScore > 5) {
    reasons.push('High student engagement');
  }
  
  return reasons;
}

function generateCollegeReasons(college: any, user: any): string[] {
  const reasons = [];
  
  const userMajor = user.major?.toLowerCase() || '';
  const stereotypes = (college.stereotypes || []).join(' ').toLowerCase();
  
  if (userMajor.includes('computer') && stereotypes.includes('stem')) {
    reasons.push('Great for STEM majors');
  }
  
  if (stereotypes.includes('creative') && (user.interests || []).includes('art')) {
    reasons.push('Creative community');
  }
  
  return reasons;
}
