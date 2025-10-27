import { z } from 'zod';
import { sanitizeInput, sanitizeEmail, sanitizeURL, sanitizeText, sanitizeTag } from '@/lib/security/sanitizer';

// 🛡️ Enhanced Security Validation Schemas
// All schemas include comprehensive sanitization and security checks

// 🔐 Base security validators
const secureString = (maxLength: number = 1000) => 
  z.string()
    .max(maxLength, `Input too long (max ${maxLength} characters)`)
    .transform(sanitizeInput)
    .refine(val => val.length > 0, 'Input cannot be empty after sanitization');

const secureEmail = () => 
  z.string()
    .email('Invalid email format')
    .transform(sanitizeEmail)
    .refine(val => val.length > 0, 'Email cannot be empty after sanitization');

const secureURL = () => 
  z.string()
    .url('Invalid URL format')
    .transform(sanitizeURL)
    .refine(val => val.length > 0, 'URL cannot be empty after sanitization');

const secureText = (maxLength: number = 5000) => 
  z.string()
    .max(maxLength, `Text too long (max ${maxLength} characters)`)
    .transform(sanitizeText)
    .refine(val => val.length > 0, 'Text cannot be empty after sanitization');

const secureTag = () => 
  z.string()
    .max(50, 'Tag too long (max 50 characters)')
    .transform(sanitizeTag)
    .refine(val => val.length > 0, 'Tag cannot be empty after sanitization');

// 🎓 Enhanced User Validation Schemas
export const SecureUserCreateSchema = z.object({
  email: secureEmail(),
  name: secureString(100),
  image: secureURL().optional(),
  ucscId: z.string()
    .regex(/^[A-Z0-9]+$/, 'UCSC ID must contain only uppercase letters and numbers')
    .max(20, 'UCSC ID too long')
    .optional(),
  major: secureString(100).optional(),
  year: z.enum(['freshman', 'sophomore', 'junior', 'senior', 'graduate']).optional(),
  college: secureString(50).optional(),
  personalityTraits: z.record(z.any()).optional(),
});

export const SecureUserUpdateSchema = SecureUserCreateSchema.partial();

export const SecureUserQuerySchema = z.object({
  page: z.coerce.number().min(1).max(1000).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: secureString(200).optional(),
  major: secureString(100).optional(),
  college: secureString(50).optional(),
});

// 🏛️ Enhanced Club Validation Schemas
export const SecureClubCreateSchema = z.object({
  name: secureString(200),
  category: secureTag(),
  description: secureText(1000).optional(),
  contactInfo: secureText(200).optional(),
  meetingTime: secureText(200).optional(),
});

export const SecureClubUpdateSchema = SecureClubCreateSchema.partial();

export const SecureClubQuerySchema = z.object({
  page: z.coerce.number().min(1).max(1000).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: secureString(200).optional(),
  category: secureTag().optional(),
  sortBy: z.enum(['name', 'category', 'popularityScore', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const SecureClubMembershipSchema = z.object({
  clubId: z.string().cuid('Invalid club ID'),
  role: z.enum(['member', 'admin', 'founder']).default('member'),
});

// 📚 Enhanced Course Validation Schemas
export const SecureCourseCreateSchema = z.object({
  code: z.string()
    .regex(/^[A-Z]{2,4}\s\d{1,3}[A-Z]?$/, 'Invalid course code format (e.g., CSE 101)')
    .max(20, 'Course code too long'),
  name: secureString(200),
  credits: z.number().min(1).max(20).optional(),
  level: z.enum(['lower', 'upper', 'graduate']).optional(),
  description: secureText(1000).optional(),
  prerequisites: secureText(500).optional(),
  quartersOffered: secureText(100).optional(),
});

export const SecureCourseUpdateSchema = SecureCourseCreateSchema.partial();

export const SecureCourseQuerySchema = z.object({
  page: z.coerce.number().min(1).max(1000).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: secureString(200).optional(),
  level: z.enum(['lower', 'upper', 'graduate']).optional(),
  department: z.string()
    .regex(/^[A-Z]{2,4}$/, 'Department must be 2-4 uppercase letters')
    .max(10, 'Department code too long')
    .optional(),
  sortBy: z.enum(['code', 'name', 'credits', 'level', 'activityScore']).default('code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const SecureStudyGroupMembershipSchema = z.object({
  courseId: z.string().cuid('Invalid course ID'),
  role: z.enum(['student', 'tutor', 'leader']).default('student'),
});

// 🏠 Enhanced College Validation Schemas
export const SecureCollegeCreateSchema = z.object({
  name: secureString(100),
  stereotype: secureText(500).optional(),
  housingQuality: secureText(500).optional(),
  funFact: secureText(500).optional(),
  vibes: secureText(500).optional(),
  imageUrl: secureURL().optional(),
});

export const SecureCollegeUpdateSchema = SecureCollegeCreateSchema.partial();

export const SecureCollegeQuerySchema = z.object({
  page: z.coerce.number().min(1).max(1000).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: secureString(200).optional(),
});

// 🎯 Enhanced College Survey Validation Schema
export const SecureCollegeSurveySchema = z.object({
  responses: z.record(z.string(), secureString(200)),
  userMajor: secureString(100).optional(),
  userYear: z.enum(['freshman', 'sophomore', 'junior', 'senior', 'graduate']).optional(),
});

// 🔍 Enhanced Search Validation Schemas
export const SecureSearchQuerySchema = z.object({
  q: secureString(200),
  type: z.enum(['clubs', 'courses', 'users', 'all']).default('all'),
  page: z.coerce.number().min(1).max(1000).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const SecureSearchAnalyticsSchema = z.object({
  searchTerm: secureString(200),
  searchType: z.enum(['clubs', 'courses', 'users', 'all']),
  resultsCount: z.number().min(0).max(10000),
  userId: z.string().cuid().optional(),
  userMajor: secureString(100).optional(),
  clickedResults: z.array(z.string().cuid()).optional(),
});

// 📊 Enhanced Analytics Validation Schemas
export const SecureUserAnalyticsUpdateSchema = z.object({
  pageViews: z.record(z.string(), z.number().min(0).max(10000)).optional(),
  featureUsage: z.record(z.string(), z.number().min(0).max(10000)).optional(),
  recommendationClicks: z.record(z.string(), z.number().min(0).max(10000)).optional(),
  sessionCount: z.number().min(0).max(10000).optional(),
  totalTimeSpent: z.number().min(0).max(100000).optional(),
});

export const SecureClubAnalyticsUpdateSchema = z.object({
  viewCount: z.number().min(0).max(100000).optional(),
  joinCount: z.number().min(0).max(10000).optional(),
  searchCount: z.number().min(0).max(100000).optional(),
  recommendationShown: z.number().min(0).max(100000).optional(),
  memberDemographics: z.record(z.any()).optional(),
});

export const SecureStudyGroupAnalyticsUpdateSchema = z.object({
  groupCount: z.number().min(0).max(1000).optional(),
  memberCount: z.number().min(0).max(10000).optional(),
  averageGroupSize: z.number().min(0).max(100).optional(),
  activityScore: z.number().min(0).max(10).optional(),
  weeklyJoins: z.record(z.string(), z.number().min(0).max(1000)).optional(),
  popularTimes: z.record(z.string(), z.number().min(0).max(1000)).optional(),
});

// 🎨 Enhanced Recommendation Schemas
export const SecureRecommendationQuerySchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  type: z.enum(['clubs', 'courses', 'colleges']),
  limit: z.coerce.number().min(1).max(20).default(6),
});

// 📈 Enhanced API Response Schemas
export const SecureApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().max(500).optional(),
  error: z.string().max(500).optional(),
  pagination: z.object({
    page: z.number().min(1),
    limit: z.number().min(1),
    total: z.number().min(0),
    pages: z.number().min(0),
  }).optional(),
});

// 🛡️ Rate Limiting Schema
export const SecureRateLimitSchema = z.object({
  windowMs: z.number().min(1000).max(3600000).default(60000), // 1 second to 1 hour
  maxRequests: z.number().min(1).max(10000).default(100),
  identifier: z.string().max(100).optional(),
});

// 🔐 Enhanced Authentication Schemas
export const SecureAuthCallbackSchema = z.object({
  provider: z.enum(['github', 'google']),
  profile: z.object({
    id: z.string().max(100),
    email: secureEmail(),
    name: secureString(100).optional(),
    image: secureURL().optional(),
  }),
});

// 🚨 Security Event Schemas
export const SecureSecurityEventSchema = z.object({
  eventType: z.enum([
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'ACCESS_DENIED',
    'SUSPICIOUS_ACTIVITY',
    'XSS_ATTEMPT',
    'SQL_INJECTION_ATTEMPT',
    'RATE_LIMIT_EXCEEDED',
  ]),
  userId: z.string().cuid().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: secureString(500).optional(),
  endpoint: secureString(200).optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  statusCode: z.number().min(100).max(599).optional(),
  errorMessage: secureString(1000).optional(),
  metadata: z.record(z.any()).optional(),
});

// Type exports for TypeScript
export type SecureUserCreate = z.infer<typeof SecureUserCreateSchema>;
export type SecureUserUpdate = z.infer<typeof SecureUserUpdateSchema>;
export type SecureUserQuery = z.infer<typeof SecureUserQuerySchema>;

export type SecureClubCreate = z.infer<typeof SecureClubCreateSchema>;
export type SecureClubUpdate = z.infer<typeof SecureClubUpdateSchema>;
export type SecureClubQuery = z.infer<typeof SecureClubQuerySchema>;
export type SecureClubMembership = z.infer<typeof SecureClubMembershipSchema>;

export type SecureCourseCreate = z.infer<typeof SecureCourseCreateSchema>;
export type SecureCourseUpdate = z.infer<typeof SecureCourseUpdateSchema>;
export type SecureCourseQuery = z.infer<typeof SecureCourseQuerySchema>;
export type SecureStudyGroupMembership = z.infer<typeof SecureStudyGroupMembershipSchema>;

export type SecureCollegeCreate = z.infer<typeof SecureCollegeCreateSchema>;
export type SecureCollegeUpdate = z.infer<typeof SecureCollegeUpdateSchema>;
export type SecureCollegeQuery = z.infer<typeof SecureCollegeQuerySchema>;
export type SecureCollegeSurvey = z.infer<typeof SecureCollegeSurveySchema>;

export type SecureSearchQuery = z.infer<typeof SecureSearchQuerySchema>;
export type SecureSearchAnalytics = z.infer<typeof SecureSearchAnalyticsSchema>;

export type SecureUserAnalyticsUpdate = z.infer<typeof SecureUserAnalyticsUpdateSchema>;
export type SecureClubAnalyticsUpdate = z.infer<typeof SecureClubAnalyticsUpdateSchema>;
export type SecureStudyGroupAnalyticsUpdate = z.infer<typeof SecureStudyGroupAnalyticsUpdateSchema>;

export type SecureRecommendationQuery = z.infer<typeof SecureRecommendationQuerySchema>;
export type SecureApiResponse = z.infer<typeof SecureApiResponseSchema>;
export type SecureRateLimit = z.infer<typeof SecureRateLimitSchema>;
export type SecureAuthCallback = z.infer<typeof SecureAuthCallbackSchema>;
export type SecureSecurityEvent = z.infer<typeof SecureSecurityEventSchema>;
