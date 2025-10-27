"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function StudyGroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Load from JSON file directly since database isn't set up
      const response = await fetch("/data/ucsc_courses.json");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter departments and courses by search
  const filteredDepartments = departments.map((dept) => ({
    ...dept,
    courses: dept.courses.filter((course: any) =>
      search === "" ||
      course.name?.toLowerCase().includes(search.toLowerCase()) ||
      course.code?.toLowerCase().includes(search.toLowerCase()) ||
      dept.department?.toLowerCase().includes(search.toLowerCase())
    )
  })).filter((dept) => dept.courses.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Study Groups</h1>
          <p className="text-xl text-purple-100">Find study partners for your courses</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full max-w-2xl px-6 py-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Courses by Department */}
        {filteredDepartments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredDepartments.map((dept, deptIdx) => (
              <div key={deptIdx}>
                {/* Department Header */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-600">
                  {dept.department}
                </h2>
                
                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dept.courses.map((course: any, courseIdx: number) => (
                    <div
                      key={`${deptIdx}-${courseIdx}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-5 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-purple-600">
                          {course.code}
                        </h3>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {course.credits} units
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium mb-2">{course.name}</p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                        Join Study Group
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

