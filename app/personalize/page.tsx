"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PersonalizePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interests, setInterests] = useState<string[]>([]);
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");

  // Removed login requirement

  const availableInterests = [
    "Technology", "Sports", "Arts", "Music", "Science",
    "Business", "Gaming", "Social Justice", "Environment",
    "Health & Wellness", "Photography", "Film", "Writing"
  ];

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    // TODO: Save to database via API
    console.log({ interests, major, year });
    router.push("/");
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
              What's your major?
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    interests.includes(interest)
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

