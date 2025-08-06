'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/question/1');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-yellow-400 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">UCSC College Matcher</h1>
        <p className="text-xl">Loading...</p>
      </div>
    </div>
  );
} 