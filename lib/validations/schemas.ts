import { z } from 'zod';

// 🎓 User Validation Schemas
export const UserCreateSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  image: z.string().url('Invalid image URL').optional(),
  ucscId: z.string().optional(),
  major: z.string().max(100, 'Major name too long').optional(),
  year: z.enum(['freshman', 'sophomore', 'junior', 'senior', 'graduate']).optional(),
  college: z.string().max(50, 'College name too long').optional(),
  personalityTraits: z.record(z.any()).optional(),
});

export const UserUpdateSchema = UserCreateSchema.partial();

export const UserQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  major: z.string().optional(),
  college: z.string().optional(),
});

// 🏛️ Club Validation Schemas
export const ClubCreateSchema = z.object({
  name: z.string().min(1, 'Club name is required').max(200, 'Club name too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  contactInfo: z.string().max(200, 'Contact info too long').optional(),
  meetingTime: z.string().max(200, 'Meeting time info too long').optional(),
});

export const ClubUpdateSchema = ClubCreateSchema.partial();

export const ClubQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['name', 'category', 'popularity', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const ClubMembershipSchema = z.object({
  clubId: z.string().cuid('Invalid club ID'),
  role: z.enum(['member', 'admin', 'founder']).default('member'),
});

// 📚 Course Validation Schemas
export const CourseCreateSchema = z.object({
  code: z.string().min(1, 'Course code is required').max(20, 'Course code too long'),
  name: z.string().min(1, 'Course name is required').max(200, 'Course name too long'),
  credits: z.number().min(1).max(20).optional(),
  level: z.enum(['lower', 'upper', 'graduate']).optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  prerequisites: z.string().max(500, 'Prerequisites too long').optional(),
  quartersOffered: z.string().max(100, 'Quarters offered info too long').optional(),
});

export const CourseUpdateSchema = CourseCreateSchema.partial();

export const CourseQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  level: z.enum(['lower', 'upper', 'graduate']).optional(),
  department: z.string().optional(),
  sortBy: z.enum(['code', 'name', 'credits', 'level']).default('code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const StudyGroupMembershipSchema = z.object({
  courseId: z.string().cuid('Invalid course ID'),
  role: z.enum(['student', 'tutor', 'leader']).default('student'),
});

// 🏠 College Validation Schemas
export const CollegeCreateSchema = z.object({
  name: z.string().min(1, 'College name is required').max(100, 'College name too long'),
  stereotype: z.string().max(500, 'Stereotype description too long').optional(),
  housingQuality: z.string().max(500, 'Housing quality description too long').optional(),
  funFact: z.string().max(500, 'Fun fact too long').optional(),
  vibes: z.string().max(500, 'Vibes description too long').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

export const CollegeUpdateSchema = CollegeCreateSchema.partial();

export const CollegeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

// 🎯 College Survey Validation Schema
export const CollegeSurveySchema = z.object({
  responses: z.record(z.string(), z.string()),
  userMajor: z.string().optional(),
  userYear: z.string().optional(),
});

// 🔍 Search Validation Schemas
export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Search query too long'),
  type: z.enum(['clubs', 'courses', 'users', 'all']).default('all'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const SearchAnalyticsSchema = z.object({
  searchTerm: z.string().min(1).max(200),
  searchType: z.enum(['clubs', 'courses', 'users', 'all']),
  resultsCount: z.number().min(0),
  userId: z.string().cuid().optional(),
  userMajor: z.string().optional(),
  clickedResults: z.array(z.string()).optional(),
});

// 📊 Analytics Validation Schemas
export const UserAnalyticsUpdateSchema = z.object({
  pageViews: z.record(z.string(), z.number()).optional(),
  featureUsage: z.record(z.string(), z.number()).optional(),
  recommendationClicks: z.record(z.string(), z.number()).optional(),
  sessionCount: z.number().min(0).optional(),
  totalTimeSpent: z.number().min(0).optional(),
});

export const ClubAnalyticsUpdateSchema = z.object({
  viewCount: z.number().min(0).optional(),
  joinCount: z.number().min(0).optional(),
  searchCount: z.number().min(0).optional(),
  recommendationShown: z.number().min(0).optional(),
  memberDemographics: z.record(z.any()).optional(),
});

export const StudyGroupAnalyticsUpdateSchema = z.object({
  groupCount: z.number().min(0).optional(),
  memberCount: z.number().min(0).optional(),
  averageGroupSize: z.number().min(0).optional(),
  activityScore: z.number().min(0).max(10).optional(),
  weeklyJoins: z.record(z.string(), z.number()).optional(),
  popularTimes: z.record(z.string(), z.number()).optional(),
});

// 🎨 Recommendation Schemas
export const RecommendationQuerySchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  type: z.enum(['clubs', 'courses', 'colleges']),
  limit: z.coerce.number().min(1).max(20).default(6),
});

// 📈 API Response Schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }).optional(),
});

// 🛡️ Rate Limiting Schema
export const RateLimitSchema = z.object({
  windowMs: z.number().min(1000).default(60000), // 1 minute
  maxRequests: z.number().min(1).default(100),
  identifier: z.string().optional(), // IP or user ID
});

// 🔐 Authentication Schemas
export const AuthCallbackSchema = z.object({
  provider: z.enum(['github', 'google']),
  profile: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    image: z.string().url().optional(),
  }),
});

// Type exports for TypeScript
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;

export type ClubCreate = z.infer<typeof ClubCreateSchema>;
export type ClubUpdate = z.infer<typeof ClubUpdateSchema>;
export type ClubQuery = z.infer<typeof ClubQuerySchema>;
export type ClubMembership = z.infer<typeof ClubMembershipSchema>;

export type CourseCreate = z.infer<typeof CourseCreateSchema>;
export type CourseUpdate = z.infer<typeof CourseUpdateSchema>;
export type CourseQuery = z.infer<typeof CourseQuerySchema>;
export type StudyGroupMembership = z.infer<typeof StudyGroupMembershipSchema>;

export type CollegeCreate = z.infer<typeof CollegeCreateSchema>;
export type CollegeUpdate = z.infer<typeof CollegeUpdateSchema>;
export type CollegeQuery = z.infer<typeof CollegeQuerySchema>;
export type CollegeSurvey = z.infer<typeof CollegeSurveySchema>;

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchAnalytics = z.infer<typeof SearchAnalyticsSchema>;

export type UserAnalyticsUpdate = z.infer<typeof UserAnalyticsUpdateSchema>;
export type ClubAnalyticsUpdate = z.infer<typeof ClubAnalyticsUpdateSchema>;
export type StudyGroupAnalyticsUpdate = z.infer<typeof StudyGroupAnalyticsUpdateSchema>;

export type RecommendationQuery = z.infer<typeof RecommendationQuerySchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type RateLimit = z.infer<typeof RateLimitSchema>;
export type AuthCallback = z.infer<typeof AuthCallbackSchema>;
