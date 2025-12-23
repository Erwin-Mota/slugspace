import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SlugSpace - Your UCSC Community Hub',
  description: 'Connect with UCSC students, join study groups, discover campus clubs, and find your perfect college match.',
  keywords: ['UCSC', 'UC Santa Cruz', 'college community', 'study groups', 'campus clubs', 'student network', 'SlugSpace'],
  authors: [{ name: 'SlugSpace' }],
  openGraph: {
    title: 'SlugSpace - Your UCSC Community Hub',
    description: 'Connect with UCSC students, join study groups, discover campus clubs, and find your perfect college match.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlugSpace - Your UCSC Community Hub',
    description: 'Connect with UCSC students, join study groups, discover campus clubs, and find your perfect college match.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 