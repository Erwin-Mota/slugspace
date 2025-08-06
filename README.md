# UCSC College Matcher

A Next.js 14 application that helps UCSC students find their perfect college match through an interactive survey.

## Features

- **Multi-step survey**: Answer questions one at a time with progress tracking
- **Tag-based matching**: Colleges are matched based on selected personality traits and preferences
- **Persistent state**: Survey progress is saved in localStorage
- **Responsive design**: Works on desktop and mobile devices
- **UCSC branding**: Uses UCSC colors (navy blue and yellow)

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **React 18** with hooks
- **Tailwind CSS** for styling
- **localStorage** for state persistence

## Getting Started

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd slug-connect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with SurveyProvider
│   ├── page.tsx            # Home page (redirects to survey)
│   ├── question/[id]/      # Dynamic question pages
│   ├── result/             # Results page
│   └── globals.css         # Global styles with Tailwind
├── components/
│   ├── QuestionCard.tsx    # Card wrapper for questions
│   ├── OptionButton.tsx    # Interactive option buttons
│   └── ProgressBar.tsx     # Survey progress indicator
├── lib/
│   └── SurveyContext.tsx   # React context for survey state
├── utils/
│   └── recommend.ts        # College matching algorithm
└── data/
    ├── questions.json      # Survey questions and options
    └── colleges.json       # College data with tags
```

## How It Works

1. **Survey Flow**: Users answer questions one by one, with each answer adding tags to their profile
2. **Matching Algorithm**: The `recommend()` function scores colleges based on matching tags
3. **Results**: Shows the best match(es) with explanations of why they matched
4. **State Management**: Survey progress is persisted in localStorage and managed via React Context

## Data Schema

### Questions
Each question has:
- `id`: Unique identifier
- `text`: Question prompt
- `options`: Array of possible answers with associated tags

### Colleges
Each college has:
- `id`: Unique identifier
- `name`: College name
- `tags`: Array of personality/preference tags
- `sources`: Reference to data sources

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Integration with Static Pages

The React survey integrates with existing static HTML pages:
- `college-finder.html` - Landing page that redirects to the survey
- `survey-redirect.html` - Smooth transition page
- Other HTML pages remain unchanged 