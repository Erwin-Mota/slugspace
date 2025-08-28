#!/bin/bash

# 🐌 SlugConnect Setup Script
# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Banner
echo -e "${YELLOW}"
cat << "EOF"
  _____ _                 _____                           _   
 / ____| |               / ____|                         | |  
| (___ | | __ _   _  ___| |     ___  _ __   __ _ _ __ __| |_ 
 \___ \| |/ / | | |/ __| |    / _ \| '_ \ / _` | '__/ _` __|
 ____) |   <| |_| | (__| |___| (_) | | | | (_| | | | (_| |_ 
|_____/|_|\_\\__,_|\___|\_____\___/|_| |_|\__,_|_|  \__,_|
                                                            
EOF
echo -e "${NC}"
echo -e "${BLUE}🚀 Welcome to SlugConnect Setup!${NC}"
echo -e "${CYAN}This script will help you get your UCSC community platform running.${NC}\n"

# Check if Node.js is installed
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    echo -e "${BLUE}💡 Visit: https://nodejs.org/${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) and npm $(npm -v) are installed${NC}\n"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚙️  Setting up environment variables...${NC}"
    cp env.example .env.local
    echo -e "${GREEN}✅ Created .env.local from template${NC}"
    echo -e "${CYAN}📝 Please edit .env.local with your actual values${NC}\n"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}\n"
fi

# Initialize Prisma
echo -e "${YELLOW}🗄️  Setting up database...${NC}"
if [ ! -d "prisma" ]; then
    echo -e "${RED}❌ Prisma schema not found. Please run 'npx prisma init' first.${NC}"
    exit 1
fi

echo -e "${CYAN}💡 Next steps:${NC}"
echo -e "${BLUE}1. ${NC}Edit .env.local with your GitHub OAuth credentials and database URL"
echo -e "${BLUE}2. ${NC}Set up your PostgreSQL database"
echo -e "${BLUE}3. ${NC}Run: ${YELLOW}npx prisma db push${NC}"
echo -e "${BLUE}4. ${NC}Run: ${YELLOW}npx prisma generate${NC}"
echo -e "${BLUE}5. ${NC}Start the development server: ${YELLOW}npm run dev${NC}\n"

# GitHub OAuth setup instructions
echo -e "${PURPLE}🔐 GitHub OAuth Setup Instructions:${NC}"
echo -e "${CYAN}1. Go to ${BLUE}https://github.com/settings/developers${NC}"
echo -e "${CYAN}2. Click 'New OAuth App'${NC}"
echo -e "${CYAN}3. Fill in the form:${NC}"
echo -e "${CYAN}   - Application name: ${YELLOW}SlugConnect${NC}"
echo -e "${CYAN}   - Homepage URL: ${YELLOW}http://localhost:3000${NC}"
echo -e "${CYAN}   - Authorization callback URL: ${YELLOW}http://localhost:3000/api/auth/callback/github${NC}"
echo -e "${CYAN}4. Click 'Register application'${NC}"
echo -e "${CYAN}5. Copy Client ID and Client Secret to .env.local${NC}\n"

# Database setup instructions
echo -e "${PURPLE}🗄️  Database Setup Instructions:${NC}"
echo -e "${CYAN}1. Install PostgreSQL${NC}"
echo -e "${CYAN}2. Create a new database: ${YELLOW}slugconnect${NC}"
echo -e "${CYAN}3. Update DATABASE_URL in .env.local${NC}"
echo -e "${CYAN}4. Run: ${YELLOW}npx prisma db push${NC}\n"

echo -e "${GREEN}🎉 Setup complete! Your SlugConnect platform is ready to configure.${NC}"
echo -e "${BLUE}💡 Need help? Check the README.md file for detailed instructions.${NC}"
echo -e "${YELLOW}🚀 Happy coding!${NC}\n" 