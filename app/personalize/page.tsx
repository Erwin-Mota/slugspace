"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function PersonalizePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interests, setInterests] = useState<string[]>([]);
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const prefs = JSON.parse(savedPreferences);
        if (prefs.interests) setInterests(prefs.interests);
        if (prefs.major) setMajor(prefs.major);
        if (prefs.year) setYear(prefs.year);
      } catch (err) {
        console.error('Error loading preferences:', err);
      }
    }
  }, []);

  // Removed login requirement

  const categories: Record<string, string[]> = useMemo(() => ({
    Sports: [
      "Martial Arts",
      "Soccer",
      "Basketball",
      "Volleyball",
      "Tennis",
      "Running",
      "Cycling",
      "Swimming",
      "Baseball",
      "Softball",
      "Football",
      "Lacrosse",
      "Ultimate Frisbee",
      "Water Polo",
      "Fencing",
      "Judo",
      "Taekwondo",
      "Badminton",
      "Rugby",
      "Triathlon",
      "Equestrian",
      "Ice Hockey",
      "Sailing",
      "Surfing",
    ],
    Tech: [
      "AI/ML",
      "Web Development",
      "Mobile Apps",
      "Cybersecurity",
      "Data Science",
      "Game Development",
      "Robotics",
      "Systems/Infra",
      "Cloud Computing",
      "Blockchain",
      "Software Engineering",
      "Computer Graphics",
      "Hardware Design",
      "UI/UX Design",
      "Human-Computer Interaction",
      "Networking",
      "Embedded Systems",
      "Quantum Computing",
      "Bioinformatics",
      "Neurotechnology",
    ],
    Writing: [
      "Creative Writing",
      "Journalism",
      "Blogging",
      "Poetry",
      "Screenwriting",
      "Editing",
      "Technical Writing",
      "Grant Writing",
      "Copywriting",
      "Short Stories",
      "Novels",
      "Non-Fiction",
      "Literary Analysis",
      "Publishing",
      "Proofreading",
    ],
    Science: [
      "Biology",
      "Chemistry",
      "Physics",
      "Neuroscience",
      "Ecology",
      "Earth Sciences",
      "Mathematics",
      "Astronomy",
      "Geology",
      "Oceanography",
      "Psychology",
      "Cognitive Science",
      "Biochemistry",
      "Genetics",
      "Environmental Science",
      "Marine Biology",
      "Anthropology",
      "Archaeology",
      "Forensics",
      "Biotechnology",
    ],
    Outdoors: [
      "Hiking",
      "Climbing",
      "Surfing",
      "Sailing",
      "Camping",
      "Trail Running",
      "Backpacking",
      "Rock Climbing",
      "Bouldering",
      "Mountain Biking",
      "Kayaking",
      "Canoeing",
      "Paddleboarding",
      "Snorkeling",
      "Scuba Diving",
      "Fishing",
      "Bird Watching",
      "Gardening",
      "Stargazing",
      "Wilderness Survival",
    ],
    Arts: [
      "Visual Arts",
      "Photography",
      "Film",
      "Dance",
      "Theater",
      "Music Performance",
      "Drawing",
      "Painting",
      "Sculpture",
      "Digital Art",
      "Graphic Design",
      "Illustration",
      "Ceramics",
      "Printmaking",
      "Animation",
      "Acting",
      "Comedy",
      "Improv",
      "Singing",
      "A Cappella",
      "Music Production",
      "DJing",
      "Fashion Design",
      "Costume Design",
    ],
    Business: [
      "Entrepreneurship",
      "Investing",
      "Marketing",
      "Consulting",
      "Product Management",
      "Sales",
      "Finance",
      "Accounting",
      "Real Estate",
      "Business Strategy",
      "Operations",
      "Supply Chain",
      "Human Resources",
      "Project Management",
      "Business Analytics",
      "E-commerce",
      "Social Media Marketing",
      "Branding",
      "Customer Relations",
      "International Business",
    ],
    "Health & Wellness": [
      "Fitness",
      "Nutrition",
      "Mental Health",
      "Public Health",
      "Pre‑Med",
      "Pre‑Vet",
      "Yoga",
      "Meditation",
      "Mindfulness",
      "Physical Therapy",
      "Occupational Therapy",
      "Dentistry",
      "Pharmacy",
      "Nursing",
      "Physician Assistant",
      "Optometry",
      "Sports Medicine",
      "Alternative Medicine",
      "Health Education",
      "Wellness Coaching",
    ],
    Gaming: [
      "Esports",
      "Fighting Games",
      "Rhythm Games",
      "Tabletop",
      "RPGs",
      "Game Design",
      "Board Games",
      "Card Games",
      "Strategy Games",
      "Puzzle Games",
      "First-Person Shooters",
      "MOBAs",
      "MMORPGs",
      "Retro Gaming",
      "Indie Games",
      "Game Art",
      "Game Programming",
      "Game Testing",
      "Speedrunning",
      "Streaming",
    ],
    "Social Impact": [
      "Volunteering",
      "Environmental Action",
      "Public Policy",
      "Community Organizing",
      "Health Equity",
      "Education",
      "Human Rights",
      "Social Justice",
      "Advocacy",
      "Non-Profit Work",
      "Fundraising",
      "Community Service",
      "Sustainable Living",
      "Climate Action",
      "Housing Rights",
      "Food Security",
      "Immigration Rights",
      "Disability Rights",
      "LGBTQ+ Advocacy",
      "Racial Justice",
    ],
    Socialization: [
      "Fraternities",
      "Sororities",
      "Greek Life",
      "Social Events",
      "Networking",
      "Community Building",
      "Professional Fraternities",
      "Multicultural Organizations",
      "Cultural Groups",
      "Identity Organizations",
      "Mentorship Programs",
      "Peer Support",
      "Study Groups",
      "Social Clubs",
      "Dining Clubs",
      "Hobby Groups",
      "Travel Groups",
      "Alumni Networks",
      "Leadership Development",
      "Team Building",
    ],
  }), []);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => (prev === category ? null : category));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Save preferences to localStorage as backup
      const preferences = {
        interests,
        major,
        year,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      // Save to database via API when user is logged in
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/v1/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              interests,
              major,
              year,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            // Don't throw - allow localStorage save to complete
            // User will see error but can still use the site
            setError(errorData.error || 'Failed to save preferences to database. Saved to browser instead.');
          }
        } catch (apiError: any) {
          console.error('API request failed:', apiError);
          // Don't throw - allow localStorage save to complete
          setError('Failed to save preferences to database. Saved to browser instead.');
        }
      }
      
      router.push("/");
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError(err.message || 'Failed to save preferences. Please try again.');
      setIsSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Personalize Your Experience</h1>
        <p className="text-gray-600 mb-8">Tell us about yourself to get better recommendations</p>

        <div className="space-y-8">
          {/* Major */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              What&apos;s your major?
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g., Computer Science"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              What year are you?
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select year</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Select your interests
            </label>

            {/* Top-level categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {Object.keys(categories).map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-between gap-2 border ${
                    expandedCategory === cat
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200"
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-sm">
                    {expandedCategory === cat ? "▾" : "▸"}
                  </span>
                </button>
              ))}
            </div>

            {/* Subcategories panel */}
            {expandedCategory && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {expandedCategory}
                  </h3>
                  <button
                    onClick={() => setExpandedCategory(null)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">Choose subcategories:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories[expandedCategory].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => toggleInterest(sub)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        interests.includes(sub)
                          ? "bg-blue-600 text-white shadow"
                          : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected chips */}
            {interests.length > 0 && (
              <div className="mt-6">
                <div className="text-sm text-gray-700 font-medium mb-2">
                  Selected interests
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200"
                    >
                      {i}
                      <button
                        onClick={() => toggleInterest(i)}
                        className="hover:text-blue-900"
                        aria-label={`Remove ${i}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

