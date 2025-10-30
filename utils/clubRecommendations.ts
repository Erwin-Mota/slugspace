// Utility functions for matching user interests to clubs

interface BaseClub {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPreferences {
  interests: string[];
  major?: string;
  year?: string;
}

/**
 * Direct mapping of specific interests to club keywords
 * This ensures precise matching
 */
const interestToKeywords: Record<string, string[]> = {
  // Martial Arts
  'martial arts': ['judo', 'taekwondo', 'muay thai', 'karate', 'grappling', 'fencing', 'martial', 'combat'],
  'judo': ['judo'],
  'taekwondo': ['taekwondo'],
  'muay thai': ['muay thai'],
  'karate': ['karate'],
  'fencing': ['fencing'],
  'grappling': ['grappling'],
  
  // Soccer
  'soccer': ['soccer', 'football'],
  
  // Running
  'running': ['cross country', 'track', 'running'],
  'cross country': ['cross country'],
  
  // Fraternities/Sororities
  'fraternities': ['fraternity', 'greek letter', 'alpha', 'sigma', 'delta', 'kappa', 'phi', 'tau'],
  'sororities': ['sorority', 'greek letter', 'alpha', 'sigma', 'delta', 'kappa', 'phi'],
  'greek life': ['fraternity', 'sorority', 'greek letter', 'greek'],
  
  // Other Sports
  'basketball': ['basketball'],
  'volleyball': ['volleyball'],
  'tennis': ['tennis'],
  'swimming': ['swimming', 'water polo'],
  'cycling': ['cycling', 'bike'],
  'baseball': ['baseball'],
  'softball': ['softball'],
  'lacrosse': ['lacrosse'],
  'rugby': ['rugby'],
  'ultimate frisbee': ['ultimate'],
  'badminton': ['badminton'],
  'triathlon': ['triathlon'],
  'sailing': ['sailing'],
  'surfing': ['surfing'],
  'ice hockey': ['ice hockey', 'hockey'],
  
  // Tech
  'ai/ml': ['ai', 'machine learning', 'artificial intelligence', 'ml'],
  'web development': ['web', 'developer', 'frontend', 'backend'],
  'cybersecurity': ['cybersecurity', 'security', 'infosec'],
  'data science': ['data science', 'data analysis', 'analytics'],
  'game development': ['game', 'gaming', 'game design'],
  
  // Arts
  'a cappella': ['a cappella', 'acappella', 'capella'],
  'dance': ['dance', 'dancing'],
  'music': ['music', 'musical'],
  'theater': ['theater', 'theatre', 'drama'],
  
  // Business
  'entrepreneurship': ['entrepreneurship', 'startup', 'entrepreneur'],
  'investing': ['investing', 'investment', 'finance'],
};

/**
 * Category-based matching for broader interests
 */
const categoryToKeywords: Record<string, string[]> = {
  'Sports': ['sport club', 'athletic'],
  'Tech': ['technology', 'computer', 'engineering', 'coding', 'programming'],
  'Writing': ['writing', 'literary', 'journalism', 'poetry'],
  'Science': ['science', 'research', 'laboratory', 'academic'],
  'Outdoors': ['outdoor', 'nature', 'hiking', 'camping'],
  'Arts': ['art', 'creative', 'design', 'visual', 'performing'],
  'Business': ['business', 'finance', 'marketing', 'consulting'],
  'Health & Wellness': ['health', 'medical', 'wellness', 'pre-med'],
  'Gaming': ['gaming', 'game', 'esports'],
  'Social Impact': ['service', 'volunteer', 'non-profit'],
  'Socialization': ['fraternity', 'sorority', 'greek', 'social'],
};

/**
 * Check if a word/phrase appears as a whole word in text (not as part of another word)
 */
function wholeWordMatch(text: string, word: string): boolean {
  // Escape special regex characters in the word
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use word boundaries for single words, or start/end boundaries for phrases
  if (word.includes(' ')) {
    // For phrases like "cross country", match at word boundaries
    const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
    return regex.test(text);
  } else {
    // For single words, use word boundaries
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(text);
  }
}

/**
 * Calculate a match score for a club based on user preferences
 */
export function calculateClubMatchScore(
  club: BaseClub,
  preferences: UserPreferences
): number {
  let score = 0;
  const clubName = club.name.toLowerCase();
  const clubDesc = club.description.toLowerCase();
  const clubCategory = club.category.toLowerCase();
  const clubText = `${clubName} ${clubDesc} ${clubCategory}`;

  preferences.interests.forEach((interest) => {
    const interestLower = interest.toLowerCase().trim();
    
    // 1. Direct keyword mapping (highest priority - 10 points)
    if (interestToKeywords[interestLower]) {
      const keywords = interestToKeywords[interestLower];
      for (const keyword of keywords) {
        // Check for whole word match in club name
        if (wholeWordMatch(clubName, keyword)) {
          score += 10;
          break;
        }
        // Check for whole word match in description
        if (wholeWordMatch(clubDesc, keyword)) {
          score += 8;
          break;
        }
        // Check for whole word match in category
        if (wholeWordMatch(clubCategory, keyword)) {
          score += 6;
        }
      }
    }
    
    // 2. Exact phrase match in club name (9 points)
    // For single words, use whole word matching to avoid false positives like "running" matching "longest running"
    if (interestLower.split(/\s+/).length === 1) {
      if (wholeWordMatch(clubName, interestLower)) {
        score += 9;
      }
    } else {
      // For phrases, allow partial matching
      if (clubName.includes(interestLower)) {
        score += 9;
      }
    }
    
    // 3. Exact phrase match in description (6 points)
    if (interestLower.split(/\s+/).length === 1) {
      if (wholeWordMatch(clubDesc, interestLower)) {
        score += 6;
      }
    } else {
      if (clubDesc.includes(interestLower)) {
        score += 6;
      }
    }
    
    // 4. Exact phrase match in category (5 points)
    if (clubCategory.includes(interestLower)) {
      score += 5;
    }
    
    // 5. Category-based matching (for broad categories like "Sports", "Tech")
    Object.entries(categoryToKeywords).forEach(([category, keywords]) => {
      if (category.toLowerCase() === interestLower || 
          interestLower.includes(category.toLowerCase())) {
        for (const keyword of keywords) {
          if (wholeWordMatch(clubText, keyword)) {
            score += 3;
          }
        }
      }
    });
    
    // 6. Greek Letter category check for fraternities/sororities
    if ((interestLower.includes('fraternity') || interestLower.includes('sorority') || 
         interestLower.includes('greek')) && clubCategory.includes('greek letter')) {
      score += 10;
    }
    
    // 7. Sport Club category check for sports
    if ((interestLower.includes('martial') || interestLower.includes('soccer') || 
         interestLower.includes('running') || interestLower.includes('basketball') ||
         interestLower.includes('volleyball') || interestLower.includes('tennis')) &&
        clubCategory.includes('sport club')) {
      // Only boost if we haven't already matched above
      if (score === 0) {
        score += 1; // Small boost only if no other match
      }
    }
  });

  // Major matching (bonus points)
  if (preferences.major) {
    const majorLower = preferences.major.toLowerCase();
    const majorWords = majorLower.split(/\s+/).filter(w => w.length > 3);
    
    majorWords.forEach(word => {
      if (wholeWordMatch(clubText, word)) {
        score += 2;
      }
    });
  }

  return score;
}

/**
 * Get recommended clubs based on user preferences
 */
export function getRecommendedClubs<T extends BaseClub>(
  clubs: T[],
  preferences: UserPreferences,
  limit: number = 10
): T[] {
  // Calculate scores for all clubs
  const scoredClubs = clubs.map(club => ({
    club,
    score: calculateClubMatchScore(club, preferences),
  }));

  // Sort by score (highest first) and return top results
  return scoredClubs
    .filter(item => item.score > 0) // Only include clubs with some match
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.club);
}

/**
 * Get non-recommended clubs (all clubs minus recommended ones)
 */
export function getNonRecommendedClubs<T extends BaseClub>(
  clubs: T[],
  recommendedClubs: T[]
): T[] {
  const recommendedIds = new Set(recommendedClubs.map(c => c.id));
  return clubs.filter(club => !recommendedIds.has(club.id));
}

