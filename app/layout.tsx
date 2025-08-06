import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SurveyProvider } from '@/lib/SurveyContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UCSC College Matcher',
  description: 'Find your perfect UCSC college match',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SurveyProvider>
          {children}
        </SurveyProvider>
      </body>
    </html>
  );
} 