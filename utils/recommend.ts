export interface College { 
  id: string; 
  name: string; 
  tags: string[];
  sources?: string[];
}

import colleges from '@/data/colleges.json' assert { type: 'json' };

export function recommend(selected: string[]) {
  const scores: Record<string, number> = {};
  
  for (const tag of selected) {
    for (const c of colleges as College[]) {
      if (c.tags.includes(tag)) {
        scores[c.id] = (scores[c.id] ?? 0) + 1;
      }
    }
  }
  
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ 
      ...(colleges as College[]).find(c => c.id === id)!, 
      score 
    }));
} 