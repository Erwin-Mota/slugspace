import { NextRequest } from 'next/server';
import { 
  createResponse, 
  createErrorResponse, 
  validateQuery,
  trackAnalytics
} from '@/lib/api/utils';
import { prisma } from '@/lib/prisma';
import { RecommendationQuerySchema } from '@/lib/validations/schemas';
import { cache } from '@/lib/redis/client';

// 🎯 GET /api/v1/recommendations - Get personalized recommendations
export async function GET(request: NextRequest) {
  try {
    // Validate query parameters
    const query = validateQuery(request, RecommendationQuerySchema);
    const { userId, type, limit } = query;

    // Check cache first
    const cacheKey = `recommendations:${userId}:${type}:${limit}`;
    const cachedRecommendations = await cache.get(cacheKey);
    
    if (cachedRecommendations) {
      console.log(`🎯 Cache hit for recommendations: ${userId}`);
      return createResponse(cachedRecommendations, 'Recommendations retrieved from cache');
    }

    // Get user profile for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        joinedClubs: {
          include: { club: true }
        },
        studyGroups: {
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

    // Cache recommendations for 1 hour
    await cache.set(cacheKey, recommendations, 3600);

    // Track recommendation views
    await trackAnalytics('recommendation_view', {
      userId,
      type,
      recommendationCount: recommendations.length
    });

    return createResponse(recommendations, 'Recommendations generated successfully');

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
      analytics: true,
      members: {
        take: 5,
        include: {
          user: {
            select: { major: true, year: true, personalityTraits: true }
          }
        }
      }
    }
  });

  // Calculate recommendation scores
  const scoredClubs = clubs.map(club => {
    let score = 0;

    // Interest matching
    const userInterests = user.personalityTraits?.interests || [];
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
    const sameCollegeMembers = club.members.filter((member: any) => 
      member.user.college === user.college
    ).length;
    score += sameCollegeMembers * 0.1;

    // Popularity boost
    score += (club.analytics?.popularityScore || 0) * 0.2;

    // Activity recency boost
    score += (club.analytics?.joinCount || 0) * 0.05;

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
      memberCount: club.members.length,
      popularityScore: club.analytics?.popularityScore || 0,
      recommendationScore: club.recommendationScore,
      reasonsToJoin: club.reasonsToJoin,
      type: 'club'
    }));
}

// 📚 Course recommendation algorithm
async function getCourseRecommendations(user: any, limit: number) {
  // Get courses user is not already in study groups for
  const joinedCourseIds = user.studyGroups.map((membership: any) => membership.course.id);
  
  const courses = await prisma.course.findMany({
    where: {
      id: { notIn: joinedCourseIds }
    },
    include: {
      analytics: true,
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

    // Level matching (recommend appropriate level courses)
    const userYear = user.year || '';
    if ((userYear === 'freshman' || userYear === 'sophomore') && course.level === 'lower') {
      score += 2;
    } else if ((userYear === 'junior' || userYear === 'senior') && course.level === 'upper') {
      score += 2;
    }

    // Activity score boost
    score += (course.analytics?.activityScore || 0) * 0.3;

    // Study group popularity
    score += course.studyGroups.length * 0.1;

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
      level: course.level,
      credits: course.credits,
      description: course.description,
      studyGroupCount: course.studyGroups.length,
      activityScore: course.analytics?.activityScore || 0,
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
    const stereotype = college.stereotype?.toLowerCase() || '';

    // Match interests with college stereotypes
    userInterests.forEach((interest: string) => {
      if (stereotype.includes(interest.toLowerCase())) {
        score += 2;
      }
    });

    // Major-based matching
    const userMajor = user.major?.toLowerCase() || '';
    if (userMajor.includes('computer') || userMajor.includes('engineering')) {
      if (collegeName.includes('crown') || stereotype.includes('stem')) {
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
      stereotype: college.stereotype,
      housingQuality: college.housingQuality,
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
  
  if (club.analytics?.popularityScore > 5) {
    reasons.push('Popular among students');
  }
  
  if (club.members.length > 20) {
    reasons.push('Active community');
  }
  
  return reasons;
}

function generateCourseReasons(course: any, user: any): string[] {
  const reasons = [];
  
  if (course.level === 'lower' && (user.year === 'freshman' || user.year === 'sophomore')) {
    reasons.push('Appropriate for your year');
  }
  
  if (course.studyGroups.length > 3) {
    reasons.push('Active study groups');
  }
  
  if (course.analytics?.activityScore > 5) {
    reasons.push('High student engagement');
  }
  
  return reasons;
}

function generateCollegeReasons(college: any, user: any): string[] {
  const reasons = [];
  
  const userMajor = user.major?.toLowerCase() || '';
  const stereotype = college.stereotype?.toLowerCase() || '';
  
  if (userMajor.includes('computer') && stereotype.includes('stem')) {
    reasons.push('Great for STEM majors');
  }
  
  if (stereotype.includes('creative') && user.personalityTraits?.interests?.includes('art')) {
    reasons.push('Creative community');
  }
  
  return reasons;
}
