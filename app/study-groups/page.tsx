"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Course {
  code: string;
  name: string;
  credits: number;
  description: string;
  prerequisites: string[];
  quarters_offered: string[];
  level: string;
}

interface StudyGroupMember {
  email: string;
  name: string | null;
  joinedAt: string | null;
}

export default function StudyGroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joinedCourses, setJoinedCourses] = useState<Set<string>>(new Set());
  const [memberEmails, setMemberEmails] = useState<Record<string, StudyGroupMember[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<Set<string>>(new Set());
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userMembershipCount, setUserMembershipCount] = useState(0);

  const fetchMembers = useCallback(async (courseCode: string) => {
    setLoadingMembers(prev => {
      if (prev.has(courseCode)) return prev;
      return new Set(prev).add(courseCode);
    });
    
    try {
      const response = await fetch(`/api/v1/study-groups/members?courseCode=${encodeURIComponent(courseCode)}`);
      if (response.ok) {
        const data = await response.json();
        setMemberEmails(prev => ({
          ...prev,
          [courseCode]: data.members || []
        }));
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoadingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseCode);
        return newSet;
      });
    }
  }, []);

  const fetchUserMemberships = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/user");
      if (response.ok) {
        const userData = await response.json();
        if (userData.studyGroupMemberships) {
          const courseCodes = new Set<string>(
            userData.studyGroupMemberships
              .map((m: any) => m.course?.code)
              .filter((code: any): code is string => Boolean(code))
          );
          setJoinedCourses(courseCodes);
          setUserMembershipCount(userData.studyGroupMemberships.length);
          
          // Fetch members for each joined course
          courseCodes.forEach((code) => {
            if (!memberEmails[code]) {
              fetchMembers(code);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user memberships:", error);
    }
  }, [memberEmails, fetchMembers]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCourses();
      fetchUserMemberships();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, fetchUserMemberships]);

  const fetchCourses = async () => {
    try {
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

  const handleJoin = async (courseCode: string) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (userMembershipCount >= 5) {
      alert("You can only join up to 5 study groups. Please leave one before joining another.");
      return;
    }

    setActionLoading(courseCode);
    try {
      const response = await fetch("/api/v1/study-groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setJoinedCourses(prev => new Set(prev).add(courseCode));
        setUserMembershipCount(prev => prev + 1);
        // Fetch members for this course
        fetchMembers(courseCode);
      } else {
        alert(data.error || "Failed to join study group");
      }
    } catch (error) {
      console.error("Error joining study group:", error);
      alert("Failed to join study group");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (courseCode: string) => {
    setShowLeaveConfirm(null);
    setActionLoading(courseCode);
    
    try {
      const response = await fetch(`/api/v1/study-groups/leave?courseCode=${encodeURIComponent(courseCode)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setJoinedCourses(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseCode);
          return newSet;
        });
        setUserMembershipCount(prev => prev - 1);
        // Remove members from state
        setMemberEmails(prev => {
          const newObj = { ...prev };
          delete newObj[courseCode];
          return newObj;
        });
      } else {
        alert(data.error || "Failed to leave study group");
      }
    } catch (error) {
      console.error("Error leaving study group:", error);
      alert("Failed to leave study group");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter departments and courses by search
  const filteredDepartments = departments.map((dept) => ({
    ...dept,
    courses: dept.courses.filter((course: Course) =>
      search === "" ||
      course.name?.toLowerCase().includes(search.toLowerCase()) ||
      course.code?.toLowerCase().includes(search.toLowerCase()) ||
      dept.department?.toLowerCase().includes(search.toLowerCase())
    )
  })).filter((dept) => dept.courses.length > 0);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Study Groups</h1>
          <p className="text-xl text-purple-100">Find study partners for your courses</p>
          {userMembershipCount > 0 && (
            <p className="text-lg text-purple-100 mt-2">
              You&apos;re in {userMembershipCount} of 5 study groups
            </p>
          )}
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
                  {dept.courses.map((course: Course, courseIdx: number) => {
                    const isJoined = joinedCourses.has(course.code);
                    const members = memberEmails[course.code] || [];
                    const isLoading = actionLoading === course.code;

                    return (
                      <div
                        key={`${deptIdx}-${courseIdx}`}
                        className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-5 border ${
                          isJoined ? "border-yellow-400 border-2" : "border-gray-200"
                        }`}
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
                        
                        {isJoined && (
                          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-yellow-800">
                                You&apos;re in this study group
                              </span>
                            </div>
                            
                            {/* Member Emails Dropdown */}
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-yellow-700 hover:text-yellow-900 font-medium">
                                View Members ({members.length})
                              </summary>
                              <div className="mt-2 max-h-40 overflow-y-auto">
                                {loadingMembers.has(course.code) ? (
                                  <p className="text-xs text-gray-500">Loading...</p>
                                ) : members.length === 0 ? (
                                  <p className="text-xs text-gray-500">No other members yet</p>
                                ) : (
                                  <ul className="space-y-1">
                                    {members.map((member, idx) => (
                                      <li key={idx} className="text-xs text-gray-700 py-1 px-2 bg-white rounded border">
                                        <span className="font-medium">{member.email}</span>
                                        {member.name && (
                                          <span className="text-gray-500 ml-2">({member.name})</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </details>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (isJoined) {
                              setShowLeaveConfirm(course.code);
                            } else {
                              handleJoin(course.code);
                            }
                          }}
                          disabled={isLoading}
                          className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                            isJoined
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : userMembershipCount >= 5
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-purple-600 hover:bg-purple-700 text-white"
                          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isLoading
                            ? "Loading..."
                            : isJoined
                            ? "Leave Study Group"
                            : "Join Study Group"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Leave Study Group?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave this study group? You will no longer be able to see other members&apos; contact information.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLeave(showLeaveConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
