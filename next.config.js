/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14, no experimental flag needed
  
  // Ensure CSS is properly processed
  swcMinify: true,
  
  // 🔒 Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  
  // 🛡️ Content Security Policy
  async rewrites() {
    return [
      {
        source: '/csp-report',
        destination: '/api/security/csp-report',
      },
    ];
  },
}

module.exports = nextConfig
