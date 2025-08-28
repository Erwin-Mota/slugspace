# 🐌 SlugConnect - Your UCSC Community Hub

A modern, secure, and beautiful platform for UCSC students to connect, join study groups, discover campus clubs, and find their perfect college match.

## ✨ Features

### 🔐 **Secure Authentication**
- **Google OAuth Integration** - Seamless login with UCSC Google accounts
- **Domain Restriction** - Only @ucsc.edu emails allowed
- **JWT Sessions** - Secure, stateless authentication
- **Auto-profile Creation** - Automatic user profile setup on first login

### 🎭 **Personalization System**
- **Interest Categories** - Hobbies, academic interests, religion, sports
- **Smart Tagging** - Organized, searchable personality traits
- **Profile Management** - Easy editing and updating of preferences

### 📚 **Study Groups**
- **1000+ UCSC Courses** - Comprehensive course database
- **Join/Leave Functionality** - Simple group management
- **Advanced Search** - Find courses by name, code, or level
- **Real-time Updates** - Instant membership changes

### 🏛️ **Campus Clubs**
- **Smart Recommendations** - AI-powered club suggestions based on interests
- **Category Organization** - Academic, Greek Life, Cultural, Sports, etc.
- **Detailed Information** - Meeting times, contact info, descriptions
- **Membership Tracking** - Join/leave clubs with ease

### 🏠 **College Finder**
- **UCSC College Showcase** - Beautiful sliding panel of all 10 colleges
- **College Stereotypes** - Fun facts and personality insights
- **Housing Quality** - Information about residential experience
- **Survey Integration** - Personalized college matching

### 🎨 **Modern UI/UX**
- **Responsive Design** - Works perfectly on all devices
- **Beautiful Animations** - Smooth transitions and micro-interactions
- **UCSC Branding** - Official blue and yellow color scheme
- **Glassmorphism** - Modern, elegant visual design

## 🚀 Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Icons** - Beautiful icon library

### **Backend & Database**
- **NextAuth.js** - Authentication framework
- **Prisma ORM** - Type-safe database queries
- **PostgreSQL** - Robust, scalable database
- **JWT Tokens** - Secure session management

### **Security Features**
- **OAuth 2.0** - Industry-standard authentication
- **Domain Gating** - UCSC email restriction
- **CSRF Protection** - Built-in security
- **Rate Limiting** - DDoS protection ready
- **Secure Cookies** - Production-ready security

## 🛠️ Setup Instructions

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- Google Cloud Console account (for OAuth)

### **1. Clone & Install**
```bash
git clone https://github.com/yourusername/slugconnect.git
cd slugconnect
npm install
```

### **2. Environment Configuration**
Copy `env.example` to `.env.local` and fill in your values:
```bash
cp env.example .env.local
```

Required environment variables:
```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Get from Google Cloud Console)
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/slugconnect?schema=public"
```

### **3. Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
6. Copy Client ID and Client Secret to `.env.local`

### **4. Database Setup**
```bash
# Initialize Prisma
npx prisma init

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### **5. Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 📁 Project Structure

```
slugconnect/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/         # NextAuth endpoints
│   ├── auth/              # Authentication pages
│   ├── clubs/             # Clubs page
│   ├── college-finder/    # College matching
│   ├── login/             # Login page
│   ├── personalize/       # User personalization
│   ├── study-groups/      # Study groups
│   └── layout.tsx         # Root layout
├── components/             # Reusable components
├── lib/                    # Utility functions
├── prisma/                 # Database schema
├── public/                 # Static assets
│   ├── colleges/          # College images
│   └── data/              # JSON data files
└── README.md              # This file
```

## 🔒 Security Features

### **Authentication Security**
- ✅ **No Password Storage** - OAuth handles all credentials
- ✅ **Domain Restriction** - Only UCSC students can access
- ✅ **JWT Security** - Secure token-based sessions
- ✅ **CSRF Protection** - Built-in NextAuth security
- ✅ **Secure Cookies** - Production-ready cookie settings

### **Data Security**
- ✅ **Input Validation** - Type-safe data handling
- ✅ **SQL Injection Protection** - Prisma ORM protection
- ✅ **XSS Prevention** - React's built-in protection
- ✅ **Rate Limiting Ready** - Easy to add production limits

## 🎯 Production Deployment

### **Recommended Hosting**
- **Vercel** - Perfect for Next.js apps
- **Railway** - Great for PostgreSQL + Node.js
- **DigitalOcean** - Full control over infrastructure

### **Environment Variables**
```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
DATABASE_URL=your-production-database-url
```

### **Database Migration**
```bash
npx prisma migrate deploy
npx prisma generate
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **UCSC Community** - For inspiration and feedback
- **Next.js Team** - For the amazing framework
- **Vercel** - For hosting and deployment tools
- **Tailwind CSS** - For the beautiful styling system

## 📞 Support

- **Issues** - [GitHub Issues](https://github.com/yourusername/slugconnect/issues)
- **Discussions** - [GitHub Discussions](https://github.com/yourusername/slugconnect/discussions)
- **Email** - support@slugconnect.ucsc.edu

---

**Built with ❤️ for UCSC students by UCSC students**

*SlugConnect - Connecting Slugs, Building Community* 