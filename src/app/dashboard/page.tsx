"use client";
import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, FileCheck, BookOpen, MessageSquare, BarChart3,
  Home, Settings, Upload, Send, Sparkles, TrendingUp, Users, CheckCircle2,
  Calendar, ChevronLeft, ChevronRight, Clock, Plus, X, AlertTriangle,
  ClipboardList, Trash2, Eye, RefreshCw, ExternalLink, Download
} from "lucide-react";
import Link from "next/link";

type Tab = "overview" | "grading" | "lessons" | "chat" | "analytics" | "calendar" | "assignments" | "canvas";

// Canvas types
interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number;
  rubric?: CanvasRubricCriterion[];
}

interface CanvasRubricCriterion {
  id: string;
  description: string;
  points: number;
  ratings: { description: string; points: number }[];
}

interface CanvasSubmission {
  id: number;
  user_id: number;
  user?: { name: string; id: number };
  body: string | null;
  grade: string | null;
  score: number | null;
  submitted_at: string | null;
  workflow_state: string;
  attachments?: { url: string; filename: string }[];
}

interface ScheduledLesson {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  type?: "lesson" | "assignment";
  assignmentId?: string;
  lessonPlanId?: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  rubricCriteria: RubricCriterion[];
  createdAt: string;
}

interface RubricCriterion {
  name: string;
  points: number;
  description: string;
}

interface SavedLessonPlan {
  id: string;
  topic: string;
  subject: string;
  grade: string;
  content: string;
  createdAt: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [scheduledLessons, setScheduledLessons] = useState<ScheduledLesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [savedLessonPlans, setSavedLessonPlans] = useState<SavedLessonPlan[]>([]);

  const addLessonToCalendar = (lesson: Omit<ScheduledLesson, "id">) => {
    const newLesson: ScheduledLesson = {
      ...lesson,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setScheduledLessons((prev) => [...prev, newLesson]);
  };

  const removeLessonFromCalendar = (id: string) => {
    setScheduledLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const addAssignment = (assignment: Omit<Assignment, "id" | "createdAt">) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setAssignments((prev) => [newAssignment, ...prev]);
  };

  const removeAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const addLessonPlanToHistory = (plan: Omit<SavedLessonPlan, "id" | "createdAt">) => {
    const newPlan: SavedLessonPlan = {
      ...plan,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setSavedLessonPlans((prev) => [newPlan, ...prev]);
  };

  const removeLessonPlan = (id: string) => {
    setSavedLessonPlans((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-slate-900 dark:text-white">EduAI</span>
        </Link>

        <nav className="flex-1 space-y-1">
          <NavItem icon={<Home />} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <NavItem icon={<ClipboardList />} label="Assignments" active={activeTab === "assignments"} onClick={() => setActiveTab("assignments")} />
          <NavItem icon={<FileCheck />} label="Grading" active={activeTab === "grading"} onClick={() => setActiveTab("grading")} />
          <NavItem icon={<BookOpen />} label="Lesson Plans" active={activeTab === "lessons"} onClick={() => setActiveTab("lessons")} />
          <NavItem icon={<Calendar />} label="Calendar" active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} />
          <NavItem icon={<MessageSquare />} label="AI Assistant" active={activeTab === "chat"} onClick={() => setActiveTab("chat")} />
          <NavItem icon={<BarChart3 />} label="Analytics" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
            <NavItem icon={<ExternalLink />} label="Canvas LMS" active={activeTab === "canvas"} onClick={() => setActiveTab("canvas")} />
          </div>
        </nav>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <NavItem icon={<Settings />} label="Settings" active={false} onClick={() => {}} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === "overview" && <OverviewTab assignmentCount={assignments.length} lessonCount={savedLessonPlans.length} />}
        {activeTab === "assignments" && <AssignmentsTab assignments={assignments} onAddAssignment={addAssignment} onRemoveAssignment={removeAssignment} onAddToCalendar={addLessonToCalendar} onGoToCalendar={() => setActiveTab("calendar")} />}
        {activeTab === "grading" && <GradingTab assignments={assignments} />}
        {activeTab === "lessons" && <LessonsTab onAddToCalendar={addLessonToCalendar} onGoToCalendar={() => setActiveTab("calendar")} savedPlans={savedLessonPlans} onSavePlan={addLessonPlanToHistory} onRemovePlan={removeLessonPlan} />}
        {activeTab === "calendar" && <CalendarTab scheduledLessons={scheduledLessons} setScheduledLessons={setScheduledLessons} onRemoveLesson={removeLessonFromCalendar} assignments={assignments} savedPlans={savedLessonPlans} />}
        {activeTab === "chat" && <ChatTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "canvas" && <CanvasTab />}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
        active 
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      <span className="h-5 w-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function OverviewTab({ assignmentCount, lessonCount }: { assignmentCount: number; lessonCount: number }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Welcome back, Teacher!</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<ClipboardList />} label="Assignments Created" value={assignmentCount.toString()} trend="Total created" />
        <StatCard icon={<BookOpen />} label="Lessons Created" value={lessonCount.toString()} trend="Total saved" />
        <StatCard icon={<Users />} label="Students" value="86" trend="3 classes" />
        <StatCard icon={<TrendingUp />} label="Time Saved" value="18h" trend="This month" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem text="Graded 24 math assignments" time="2 hours ago" />
            <ActivityItem text="Generated lesson plan for Chapter 5" time="Yesterday" />
            <ActivityItem text="Class performance report generated" time="2 days ago" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={<Upload />} label="Upload Assignment" />
            <QuickAction icon={<BookOpen />} label="New Lesson Plan" />
            <QuickAction icon={<MessageSquare />} label="Ask AI" />
            <QuickAction icon={<BarChart3 />} label="View Reports" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-green-600">{trend}</div>
    </div>
  );
}

function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <CheckCircle2 className="h-5 w-5 text-green-500" />
      <div className="flex-1">
        <p className="text-slate-700 dark:text-slate-300">{text}</p>
        <p className="text-sm text-slate-500">{time}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition">
      <span className="text-blue-600">{icon}</span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </button>
  );
}

interface AIDetectionResult {
  score: number;
  verdict: string;
  confidence: string;
  details: {
    aiSentenceCount: number;
    totalSentences: number;
    percentageAI: number;
  };
}

function GradingTab({ assignments }: { assignments: Assignment[] }) {
  const [rubric, setRubric] = useState("");
  const [studentWork, setStudentWork] = useState("");
  const [assignmentType, setAssignmentType] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [aiDetection, setAiDetection] = useState<AIDetectionResult | null>(null);
  const [detectionError, setDetectionError] = useState("");

  // Canvas state
  const [showCanvasImport, setShowCanvasImport] = useState(false);
  const [canvasCourses, setCanvasCourses] = useState<CanvasCourse[]>([]);
  const [canvasAssignments, setCanvasAssignments] = useState<CanvasAssignment[]>([]);
  const [canvasSubmissions, setCanvasSubmissions] = useState<CanvasSubmission[]>([]);
  const [selectedCanvasCourse, setSelectedCanvasCourse] = useState<CanvasCourse | null>(null);
  const [selectedCanvasAssignment, setSelectedCanvasAssignment] = useState<CanvasAssignment | null>(null);
  const [selectedCanvasSubmission, setSelectedCanvasSubmission] = useState<CanvasSubmission | null>(null);
  const [canvasLoading, setCanvasLoading] = useState(false);
  const [gradeToPost, setGradeToPost] = useState("");
  const [teacherComment, setTeacherComment] = useState("");
  const [isPostingGrade, setIsPostingGrade] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Fetch Canvas courses
  const fetchCanvasCourses = async () => {
    setCanvasLoading(true);
    try {
      const res = await fetch("/api/canvas?action=courses");
      const data = await res.json();
      if (!data.error) setCanvasCourses(data.courses || []);
    } catch (e) { console.error(e); }
    finally { setCanvasLoading(false); }
  };

  // Fetch Canvas assignments for a course
  const fetchCanvasAssignments = async (courseId: number) => {
    setCanvasLoading(true);
    setCanvasAssignments([]);
    setCanvasSubmissions([]);
    try {
      const res = await fetch(`/api/canvas?action=assignments&courseId=${courseId}`);
      const data = await res.json();
      if (!data.error) setCanvasAssignments(data.assignments || []);
    } catch (e) { console.error(e); }
    finally { setCanvasLoading(false); }
  };

  // Fetch submissions for an assignment
  const fetchCanvasSubmissions = async (courseId: number, assignmentId: number) => {
    setCanvasLoading(true);
    setCanvasSubmissions([]);
    try {
      const res = await fetch(`/api/canvas?action=submissions&courseId=${courseId}&assignmentId=${assignmentId}`);
      const data = await res.json();
      if (!data.error) setCanvasSubmissions(data.submissions || []);
    } catch (e) { console.error(e); }
    finally { setCanvasLoading(false); }
  };

  // Post grade to Canvas
  const postGradeToCanvas = async () => {
    if (!selectedCanvasCourse || !selectedCanvasAssignment || !selectedCanvasSubmission || !gradeToPost) return;
    setIsPostingGrade(true);
    setPostSuccess(false);
    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "postGrade",
          courseId: selectedCanvasCourse.id,
          assignmentId: selectedCanvasAssignment.id,
          studentId: selectedCanvasSubmission.user_id,
          grade: gradeToPost,
          comment: teacherComment, // Use teacher's custom comment instead of AI feedback
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setPostSuccess(true);
        // Refresh submissions
        fetchCanvasSubmissions(selectedCanvasCourse.id, selectedCanvasAssignment.id);
      }
    } catch (e) { console.error(e); }
    finally { setIsPostingGrade(false); }
  };

  // Load a Canvas submission into the grading form
  const loadCanvasSubmission = (sub: CanvasSubmission) => {
    setSelectedCanvasSubmission(sub);
    // Strip HTML tags for plain text
    const plainText = sub.body ? sub.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : "";
    setStudentWork(plainText);
    setGradeToPost(sub.score?.toString() || "");
    setTeacherComment("");
    setFeedback("");
    setAiDetection(null);
    setPostSuccess(false);

    // Set rubric from Canvas assignment if available
    if (selectedCanvasAssignment) {
      setAssignmentType(selectedCanvasAssignment.name);
      if (selectedCanvasAssignment.rubric) {
        const rubricText = selectedCanvasAssignment.rubric.map(r =>
          `${r.description} (${r.points} pts)`
        ).join("\n");
        setRubric(rubricText);
      } else {
        setRubric(`Total Points: ${selectedCanvasAssignment.points_possible}`);
      }
    }
  };

  // When an assignment is selected, auto-fill the rubric
  const handleAssignmentSelect = (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      const rubricText = assignment.rubricCriteria.map(c =>
        `${c.name} (${c.points} pts): ${c.description}`
      ).join("\n");
      setRubric(rubricText);
      setAssignmentType(assignment.subject);
    }
  };

  const handleGrade = async () => {
    if (!rubric || !studentWork) return;
    setIsLoading(true);
    setFeedback("");

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentWork, rubric, assignmentType }),
      });
      const data = await response.json();

      if (data.error) {
        setFeedback(`Error: ${data.error}`);
      } else {
        setFeedback(data.feedback);
      }
    } catch {
      setFeedback("Failed to grade assignment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectAI = async () => {
    if (!studentWork || studentWork.length < 50) {
      setDetectionError("Please enter at least 50 characters of student work to analyze.");
      return;
    }
    setIsDetecting(true);
    setAiDetection(null);
    setDetectionError("");

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: studentWork }),
      });
      const data = await response.json();

      if (data.error) {
        setDetectionError(data.error);
      } else {
        setAiDetection(data);
      }
    } catch {
      setDetectionError("Failed to analyze text. Please try again.");
    } finally {
      setIsDetecting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600 dark:text-red-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    if (score >= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-red-100 dark:bg-red-900/30";
    if (score >= 50) return "bg-orange-100 dark:bg-orange-900/30";
    if (score >= 30) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-green-100 dark:bg-green-900/30";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Automated Grading</h1>
        <button
          onClick={() => { setShowCanvasImport(!showCanvasImport); if (!showCanvasImport && canvasCourses.length === 0) fetchCanvasCourses(); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition"
        >
          <ExternalLink className="h-4 w-4" />
          {showCanvasImport ? "Hide Canvas" : "Import from Canvas"}
        </button>
      </div>

      {/* Canvas Import Panel */}
      {showCanvasImport && (
        <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
          <h3 className="font-semibold text-lg text-orange-800 dark:text-orange-200 mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5" /> Canvas LMS - Import Submission
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Course Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1. Select Course</label>
              <select
                value={selectedCanvasCourse?.id || ""}
                onChange={(e) => {
                  const course = canvasCourses.find(c => c.id === Number(e.target.value));
                  setSelectedCanvasCourse(course || null);
                  setSelectedCanvasAssignment(null);
                  setCanvasSubmissions([]);
                  if (course) fetchCanvasAssignments(course.id);
                }}
                className="w-full p-3 bg-white dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
              >
                <option value="">{canvasLoading ? "Loading..." : "-- Select Course --"}</option>
                {canvasCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {/* Assignment Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">2. Select Assignment</label>
              <select
                value={selectedCanvasAssignment?.id || ""}
                onChange={(e) => {
                  const assignment = canvasAssignments.find(a => a.id === Number(e.target.value));
                  setSelectedCanvasAssignment(assignment || null);
                  setSelectedCanvasSubmission(null);
                  if (assignment && selectedCanvasCourse) fetchCanvasSubmissions(selectedCanvasCourse.id, assignment.id);
                }}
                disabled={!selectedCanvasCourse}
                className="w-full p-3 bg-white dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              >
                <option value="">{canvasLoading ? "Loading..." : "-- Select Assignment --"}</option>
                {canvasAssignments.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.points_possible} pts)</option>
                ))}
              </select>
            </div>
            {/* Submission Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">3. Select Student</label>
              <select
                value={selectedCanvasSubmission?.id || ""}
                onChange={(e) => {
                  const sub = canvasSubmissions.find(s => s.id === Number(e.target.value));
                  if (sub) loadCanvasSubmission(sub);
                }}
                disabled={!selectedCanvasAssignment}
                className="w-full p-3 bg-white dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              >
                <option value="">{canvasLoading ? "Loading..." : "-- Select Student --"}</option>
                {canvasSubmissions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.user?.name || `Student ${s.user_id}`} {s.score !== null ? `(${s.score}/${selectedCanvasAssignment?.points_possible})` : "(ungraded)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedCanvasSubmission && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-700 dark:text-green-300 text-sm">
              ✓ Loaded submission from <strong>{selectedCanvasSubmission.user?.name}</strong>. Grade below then post back to Canvas!
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Student Work</h3>
            {/* Assignment Selector */}
            {!selectedCanvasAssignment && assignments.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Assignment (optional)</label>
                <select
                  value={selectedAssignment}
                  onChange={(e) => handleAssignmentSelect(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Use custom rubric --</option>
                  {assignments.map(a => (
                    <option key={a.id} value={a.id}>{a.title} ({a.subject})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assignment Type</label>
              <input
                type="text"
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
                placeholder="e.g., Essay, Short Answer, Lab Report"
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              value={studentWork}
              onChange={(e) => { setStudentWork(e.target.value); setAiDetection(null); }}
              placeholder="Paste the student's work here or import from Canvas..."
              className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 resize-none focus:ring-2 focus:ring-blue-500"
            />
            {/* AI Detection Button */}
            <button
              onClick={handleDetectAI}
              disabled={isDetecting || !studentWork}
              className="mt-3 w-full bg-purple-600 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDetecting ? (
                <>Analyzing...</>
              ) : (
                <><AlertTriangle className="h-4 w-4" /> Detect AI-Generated Content</>
              )}
            </button>
            {/* AI Detection Results */}
            {detectionError && (
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                {detectionError}
              </div>
            )}
            {aiDetection && (
              <div className={`mt-3 p-4 rounded-xl ${getScoreBg(aiDetection.score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-900 dark:text-white">AI Detection Result</span>
                  <span className={`text-2xl font-bold ${getScoreColor(aiDetection.score)}`}>
                    {aiDetection.score}%
                  </span>
                </div>
                <div className={`text-lg font-medium ${getScoreColor(aiDetection.score)}`}>
                  {aiDetection.verdict}
                </div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Confidence:</span> {aiDetection.confidence}
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">{aiDetection.details.aiSentenceCount}</span> of {aiDetection.details.totalSentences} sentences flagged ({aiDetection.details.percentageAI}%)
                </div>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Grading Rubric</h3>
            <textarea
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              placeholder="Enter your grading rubric here...&#10;&#10;Example:&#10;- Content accuracy (40%)&#10;- Grammar & spelling (20%)&#10;- Organization (20%)&#10;- Creativity (20%)"
              className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 resize-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleGrade}
              disabled={isLoading || !rubric || !studentWork}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>Grading...</>
              ) : (
                <><Sparkles className="h-5 w-5" /> Grade with AI</>
              )}
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-h-[500px] overflow-auto">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">AI Feedback</h3>
            {feedback ? (
              <div className="prose dark:prose-invert max-w-none text-sm">
                <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">{feedback}</pre>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter student work and rubric, then click Grade with AI</p>
                <p className="text-sm mt-2">AI will provide detailed feedback and suggested grades</p>
              </div>
            )}
          </div>

          {/* Post to Canvas */}
          {selectedCanvasSubmission && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" /> Post Grade to Canvas
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Grade (out of {selectedCanvasAssignment?.points_possible})
                  </label>
                  <input
                    type="number"
                    value={gradeToPost}
                    onChange={(e) => setGradeToPost(e.target.value)}
                    max={selectedCanvasAssignment?.points_possible}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter grade..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Comment to Student (optional)
                  </label>
                  <textarea
                    value={teacherComment}
                    onChange={(e) => setTeacherComment(e.target.value)}
                    placeholder="Write your feedback for the student here..."
                    className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 resize-none focus:ring-2 focus:ring-blue-500"
                  />
                  {feedback && (
                    <button
                      onClick={() => setTeacherComment(feedback)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      ↑ Copy AI feedback above as your comment
                    </button>
                  )}
                </div>
                <button
                  onClick={postGradeToCanvas}
                  disabled={isPostingGrade || !gradeToPost}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPostingGrade ? (
                    <>Posting...</>
                  ) : (
                    <><CheckCircle2 className="h-5 w-5" /> Post Grade to Canvas</>
                  )}
                </button>
                {postSuccess && (
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-700 dark:text-green-300 text-sm text-center">
                    ✓ Grade posted successfully to Canvas!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LessonsTabProps {
  onAddToCalendar: (lesson: Omit<ScheduledLesson, "id">) => void;
  onGoToCalendar: () => void;
  savedPlans: SavedLessonPlan[];
  onSavePlan: (plan: Omit<SavedLessonPlan, "id" | "createdAt">) => void;
  onRemovePlan: (id: string) => void;
}

function LessonsTab({ onAddToCalendar, onGoToCalendar, savedPlans, onSavePlan, onRemovePlan }: LessonsTabProps) {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [lessonPlan, setLessonPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("9:00 AM");
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<SavedLessonPlan | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic || !grade) return;
    setIsLoading(true);
    setLessonPlan("");
    setAddedToCalendar(false);
    setSavedToHistory(false);
    setCurrentPlanId(null);

    try {
      const response = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, grade: `${grade}th Grade`, subject }),
      });
      const data = await response.json();

      if (data.error) {
        setLessonPlan(`Error: ${data.error}`);
      } else {
        setLessonPlan(data.lessonPlan);
      }
    } catch {
      setLessonPlan("Failed to generate lesson plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToHistory = () => {
    // Generate a unique ID for the plan
    const planId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setCurrentPlanId(planId);
    onSavePlan({
      topic,
      subject: subject || "General",
      grade: `${grade}th Grade`,
      content: lessonPlan,
    });
    setSavedToHistory(true);
  };

  const handleAddToCalendar = () => {
    const today = new Date();
    setScheduleDate(today.toISOString().split("T")[0]);
    setShowScheduleModal(true);
  };

  const confirmAddToCalendar = () => {
    // Find the most recently saved plan that matches this topic
    const matchingPlan = savedPlans.find(p => p.topic === topic && p.content === lessonPlan);

    onAddToCalendar({
      title: topic,
      subject: subject || "General",
      date: scheduleDate,
      time: scheduleTime,
      duration: "45 min",
      type: "lesson",
      lessonPlanId: matchingPlan?.id || currentPlanId || undefined,
    });
    setShowScheduleModal(false);
    setAddedToCalendar(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Lesson Plan Generator</h1>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Lesson</h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-500 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lesson</label>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white font-medium">
                  {topic}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                <select
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option>8:00 AM</option>
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>12:00 PM</option>
                  <option>1:00 PM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                </select>
              </div>
              <button
                onClick={confirmAddToCalendar}
                disabled={!scheduleDate}
                className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Generate New Plan</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Quadratic Equations"
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Biology, Math, History"
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grade Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select grade</option>
                <option value="6">6th Grade</option>
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
                <option value="9">9th Grade</option>
                <option value="10">10th Grade</option>
                <option value="11">11th Grade</option>
                <option value="12">12th Grade</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !topic || !grade}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>Generating...</>
              ) : (
                <><Sparkles className="h-5 w-5" /> Generate Lesson Plan</>
              )}
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-h-[600px] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
              {viewingPlan ? "Viewing Saved Plan" : lessonPlan ? "Generated Lesson Plan" : "Saved Plans"}
            </h3>
            <div className="flex gap-2">
              {viewingPlan && (
                <button
                  onClick={() => setViewingPlan(null)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  <X className="h-4 w-4" />
                  Close
                </button>
              )}
              {lessonPlan && !lessonPlan.startsWith("Error") && !viewingPlan && (
                <>
                  {savedToHistory ? (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Saved
                    </span>
                  ) : (
                    <button
                      onClick={handleSaveToHistory}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      <Plus className="h-4 w-4" />
                      Save
                    </button>
                  )}
                  {addedToCalendar ? (
                    <button
                      onClick={onGoToCalendar}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Calendar
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCalendar}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          {viewingPlan ? (
            <div>
              <div className="mb-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <p className="font-medium text-slate-900 dark:text-white">{viewingPlan.topic}</p>
                <p className="text-sm text-slate-500">{viewingPlan.subject} • {viewingPlan.grade}</p>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm">
                <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">{viewingPlan.content}</pre>
              </div>
            </div>
          ) : lessonPlan ? (
            <div className="prose dark:prose-invert max-w-none text-sm">
              <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">{lessonPlan}</pre>
            </div>
          ) : savedPlans.length > 0 ? (
            <div className="space-y-3">
              {savedPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex-1 cursor-pointer" onClick={() => setViewingPlan(plan)}>
                    <p className="font-medium text-slate-900 dark:text-white">{plan.topic}</p>
                    <p className="text-sm text-slate-500">{plan.subject} • {plan.grade}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingPlan(plan)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRemovePlan(plan.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No saved lesson plans yet</p>
              <p className="text-sm">Generate a lesson plan and save it to see it here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AssignmentsTabProps {
  assignments: Assignment[];
  onAddAssignment: (assignment: Omit<Assignment, "id" | "createdAt">) => void;
  onRemoveAssignment: (id: string) => void;
  onAddToCalendar: (lesson: Omit<ScheduledLesson, "id">) => void;
  onGoToCalendar: () => void;
}

function AssignmentsTab({ assignments, onAddAssignment, onRemoveAssignment, onAddToCalendar, onGoToCalendar }: AssignmentsTabProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([
    { name: "", points: 10, description: "" }
  ]);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingAssignment, setSchedulingAssignment] = useState<Assignment | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("9:00 AM");
  const [addedToCalendar, setAddedToCalendar] = useState<Set<string>>(new Set());

  // Canvas state
  const [showCanvasPost, setShowCanvasPost] = useState(false);
  const [canvasCourses, setCanvasCourses] = useState<CanvasCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isPostingToCanvas, setIsPostingToCanvas] = useState(false);
  const [canvasPostSuccess, setCanvasPostSuccess] = useState<string | null>(null);
  const [canvasPostError, setCanvasPostError] = useState<string | null>(null);

  // Fetch Canvas courses
  const fetchCanvasCourses = async () => {
    try {
      const res = await fetch("/api/canvas?action=courses");
      const data = await res.json();
      if (!data.error) setCanvasCourses(data.courses || []);
    } catch (e) { console.error(e); }
  };

  // Post assignment to Canvas
  const postAssignmentToCanvas = async (assignment: Assignment) => {
    if (!selectedCourseId) return;
    setIsPostingToCanvas(true);
    setCanvasPostError(null);
    setCanvasPostSuccess(null);
    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createAssignment",
          courseId: selectedCourseId,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          totalPoints: assignment.totalPoints,
          rubricCriteria: assignment.rubricCriteria,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setCanvasPostError(data.error);
      } else {
        setCanvasPostSuccess(assignment.title);
        setShowCanvasPost(false);
      }
    } catch (e) {
      setCanvasPostError("Failed to post to Canvas");
      console.error(e);
    } finally {
      setIsPostingToCanvas(false);
    }
  };

  const handleAddToCalendar = (assignment: Assignment) => {
    setSchedulingAssignment(assignment);
    setScheduleDate(assignment.dueDate || new Date().toISOString().split("T")[0]);
    setShowScheduleModal(true);
  };

  const confirmAddToCalendar = () => {
    if (!schedulingAssignment) return;
    onAddToCalendar({
      title: `📝 ${schedulingAssignment.title}`,
      subject: schedulingAssignment.subject,
      date: scheduleDate,
      time: scheduleTime,
      duration: "Due",
      type: "assignment",
      assignmentId: schedulingAssignment.id,
    });
    setAddedToCalendar(prev => new Set([...prev, schedulingAssignment.id]));
    setShowScheduleModal(false);
    setSchedulingAssignment(null);
  };

  const addCriterion = () => {
    setRubricCriteria([...rubricCriteria, { name: "", points: 10, description: "" }]);
  };

  const removeCriterion = (index: number) => {
    if (rubricCriteria.length > 1) {
      setRubricCriteria(rubricCriteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index: number, field: keyof RubricCriterion, value: string | number) => {
    const updated = [...rubricCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setRubricCriteria(updated);
  };

  const totalPoints = rubricCriteria.reduce((sum, c) => sum + c.points, 0);

  const handleCreate = () => {
    if (!title || !subject || rubricCriteria.some(c => !c.name)) return;

    onAddAssignment({
      title,
      subject,
      description,
      dueDate,
      totalPoints,
      rubricCriteria: rubricCriteria.filter(c => c.name),
    });

    // Reset form
    setTitle("");
    setSubject("");
    setDescription("");
    setDueDate("");
    setRubricCriteria([{ name: "", points: 10, description: "" }]);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Assignment Creator</h1>

      {/* Canvas Post Modal */}
      {showCanvasPost && viewingAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-orange-600" /> Post to Canvas
              </h2>
              <button onClick={() => { setShowCanvasPost(false); setViewingAssignment(null); }} className="text-slate-500 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <p className="font-medium text-slate-900 dark:text-white">{viewingAssignment.title}</p>
                <p className="text-sm text-slate-500">{viewingAssignment.totalPoints} pts • {viewingAssignment.rubricCriteria.length} rubric criteria</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Canvas Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Select Course --</option>
                  {canvasCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {canvasPostError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                  {canvasPostError}
                </div>
              )}
              {canvasPostSuccess && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-sm">
                  ✓ {canvasPostSuccess} posted to Canvas!
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowCanvasPost(false); setViewingAssignment(null); }}
                  className="flex-1 py-3 rounded-xl font-semibold border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => postAssignmentToCanvas(viewingAssignment)}
                  disabled={isPostingToCanvas || !selectedCourseId}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPostingToCanvas ? "Posting..." : (
                    <><ExternalLink className="h-4 w-4" /> Post to Canvas</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Assignment Modal */}
      {/* Schedule Modal */}
      {showScheduleModal && schedulingAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add to Calendar</h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-500 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignment</label>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white font-medium">
                  {schedulingAssignment.title}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                <select
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                >
                  {["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddToCalendar}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Assignment Modal */}
      {viewingAssignment && !showCanvasPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{viewingAssignment.title}</h2>
              <button onClick={() => setViewingAssignment(null)} className="text-slate-500 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">{viewingAssignment.subject}</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">{viewingAssignment.totalPoints} pts</span>
                {viewingAssignment.dueDate && (
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">Due: {new Date(viewingAssignment.dueDate).toLocaleDateString()}</span>
                )}
              </div>
              {viewingAssignment.description && (
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Description</h4>
                  <p className="text-slate-600 dark:text-slate-400">{viewingAssignment.description}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Rubric Criteria</h4>
                <div className="space-y-2">
                  {viewingAssignment.rubricCriteria.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-900 dark:text-white">{c.name}</span>
                        <span className="text-blue-600 font-semibold">{c.points} pts</span>
                      </div>
                      {c.description && <p className="text-sm text-slate-500 mt-1">{c.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
              {/* Add to Calendar button in modal */}
              <div className="pt-2">
                {addedToCalendar.has(viewingAssignment.id) ? (
                  <button
                    onClick={() => { setViewingAssignment(null); onGoToCalendar(); }}
                    className="w-full py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    View in Calendar
                  </button>
                ) : (
                  <button
                    onClick={() => { setViewingAssignment(null); handleAddToCalendar(viewingAssignment); }}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    Add to Calendar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Create New Assignment</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chapter 5 Essay, Lab Report #3"
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Biology, Math"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Assignment instructions and requirements..."
                className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Rubric Builder */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rubric Criteria *</label>
                <span className="text-sm font-semibold text-blue-600">Total: {totalPoints} pts</span>
              </div>
              <div className="space-y-3">
                {rubricCriteria.map((criterion, index) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={criterion.name}
                        onChange={(e) => updateCriterion(index, "name", e.target.value)}
                        placeholder="Criterion name (e.g., Content, Grammar)"
                        className="flex-1 p-2 bg-white dark:bg-slate-600 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={criterion.points}
                        onChange={(e) => updateCriterion(index, "points", parseInt(e.target.value) || 0)}
                        className="w-20 p-2 bg-white dark:bg-slate-600 rounded-lg border-0 text-sm text-center focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                      <button
                        onClick={() => removeCriterion(index)}
                        disabled={rubricCriteria.length === 1}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={criterion.description}
                      onChange={(e) => updateCriterion(index, "description", e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={addCriterion}
                className="mt-3 w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Criterion
              </button>
            </div>

            <button
              onClick={handleCreate}
              disabled={!title || !subject || rubricCriteria.every(c => !c.name)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ClipboardList className="h-5 w-5" />
              Create Assignment
            </button>
          </div>
        </div>

        {/* Assignment History */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-h-[700px] overflow-auto">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
            Created Assignments ({assignments.length})
          </h3>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{assignment.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="text-slate-500">{assignment.subject}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-blue-600 font-medium">{assignment.totalPoints} pts</span>
                        {assignment.dueDate && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="text-orange-600">Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {assignment.rubricCriteria.slice(0, 3).map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs text-slate-600 dark:text-slate-300">
                            {c.name} ({c.points})
                          </span>
                        ))}
                        {assignment.rubricCriteria.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs text-slate-600 dark:text-slate-300">
                            +{assignment.rubricCriteria.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setShowCanvasPost(true); setViewingAssignment(assignment); if (canvasCourses.length === 0) fetchCanvasCourses(); }}
                        className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition"
                        title="Post to Canvas"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      {addedToCalendar.has(assignment.id) ? (
                        <button
                          onClick={onGoToCalendar}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"
                          title="View in Calendar"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCalendar(assignment)}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"
                          title="Add to Calendar"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setViewingAssignment(assignment)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onRemoveAssignment(assignment.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No assignments created yet</p>
              <p className="text-sm">Create your first assignment using the form</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatTab() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    { role: "assistant", content: "Hello! I'm your AI teaching assistant. How can I help you today? I can help with lesson ideas, classroom management tips, or answer any teaching-related questions." }
  ]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    const userMessage = message;
    setMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const chatHistory = messages.filter(m => m.role !== "assistant" || messages.indexOf(m) !== 0)
        .map(m => ({ role: m.role, content: m.content }));
      chatHistory.push({ role: "user", content: userMessage });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });
      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">AI Teaching Assistant</h1>
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 flex flex-col">
        <div className="flex-1 overflow-auto space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything about teaching..."
            className="flex-1 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Class Analytics</h1>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <AnalyticsCard label="Class Average" value="84%" change="+3%" />
        <AnalyticsCard label="Completion Rate" value="92%" change="+5%" />
        <AnalyticsCard label="Improvement" value="12%" change="+2%" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Performance by Subject</h3>
          <div className="space-y-4">
            <ProgressBar label="Mathematics" value={87} />
            <ProgressBar label="Science" value={79} />
            <ProgressBar label="English" value={91} />
            <ProgressBar label="History" value={83} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Areas for Improvement</h3>
          <div className="space-y-3">
            <ImprovementItem area="Word Problems" students={12} />
            <ImprovementItem area="Essay Writing" students={8} />
            <ImprovementItem area="Lab Reports" students={6} />
            <ImprovementItem area="Critical Analysis" students={5} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
      <p className="text-slate-600 dark:text-slate-400 mb-2">{label}</p>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-slate-900 dark:text-white">{value}</span>
        <span className="text-green-500 text-sm mb-1">{change}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-slate-900 dark:text-white font-medium">{value}%</span>
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ImprovementItem({ area, students }: { area: string; students: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
      <span className="text-slate-700 dark:text-slate-300">{area}</span>
      <span className="text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full">
        {students} students
      </span>
    </div>
  );
}

interface CalendarTabProps {
  scheduledLessons: ScheduledLesson[];
  setScheduledLessons: React.Dispatch<React.SetStateAction<ScheduledLesson[]>>;
  onRemoveLesson: (id: string) => void;
  assignments: Assignment[];
  savedPlans: SavedLessonPlan[];
}

function CalendarTab({ scheduledLessons, setScheduledLessons, onRemoveLesson, assignments, savedPlans }: CalendarTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  const [autoScheduleForm, setAutoScheduleForm] = useState({ topic: "", subject: "Math", grade: "5th Grade", lessonsPerWeek: "3" });
  const [isScheduling, setIsScheduling] = useState(false);
  const [viewingItem, setViewingItem] = useState<ScheduledLesson | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"];

  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const getLessonsForSlot = (date: Date, time: string) => {
    return scheduledLessons.filter(
      (lesson) => lesson.date === formatDate(date) && lesson.time === time
    );
  };

  const autoScheduleLessons = async () => {
    setIsScheduling(true);
    try {
      const response = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: autoScheduleForm.topic,
          grade: autoScheduleForm.grade,
          subject: autoScheduleForm.subject,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate lesson");

      const lessonsPerWeek = parseInt(autoScheduleForm.lessonsPerWeek);
      const availableDays = [1, 2, 3, 4, 5]; // Mon-Fri
      const selectedDays = availableDays.slice(0, lessonsPerWeek);

      const newLessons: ScheduledLesson[] = selectedDays.map((dayOffset, index) => {
        const lessonDate = new Date(weekDates[0]);
        lessonDate.setDate(weekDates[0].getDate() + dayOffset);
        return {
          id: `${Date.now()}-${index}`,
          title: `${autoScheduleForm.topic} - Part ${index + 1}`,
          subject: autoScheduleForm.subject,
          date: formatDate(lessonDate),
          time: timeSlots[index % timeSlots.length],
          duration: "45 min",
        };
      });

      setScheduledLessons((prev) => [...prev, ...newLessons]);
      setShowAutoSchedule(false);
      setAutoScheduleForm({ topic: "", subject: "Math", grade: "5th Grade", lessonsPerWeek: "3" });
    } catch (error) {
      console.error("Auto-schedule error:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Lesson Calendar</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Auto-schedule your lesson plans</p>
        </div>
        <button
          onClick={() => setShowAutoSchedule(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <Sparkles className="h-5 w-5" />
          Auto-Schedule Lessons
        </button>
      </div>

      {/* Auto-Schedule Modal */}
      {showAutoSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Auto-Schedule Lessons</h2>
              <button onClick={() => setShowAutoSchedule(false)} className="text-slate-500 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic/Unit</label>
                <input
                  type="text"
                  value={autoScheduleForm.topic}
                  onChange={(e) => setAutoScheduleForm({ ...autoScheduleForm, topic: e.target.value })}
                  placeholder="e.g., Fractions, Civil War, Photosynthesis"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    value={autoScheduleForm.subject}
                    onChange={(e) => setAutoScheduleForm({ ...autoScheduleForm, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option>Math</option>
                    <option>Science</option>
                    <option>English</option>
                    <option>History</option>
                    <option>Art</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                  <select
                    value={autoScheduleForm.grade}
                    onChange={(e) => setAutoScheduleForm({ ...autoScheduleForm, grade: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option>3rd Grade</option>
                    <option>4th Grade</option>
                    <option>5th Grade</option>
                    <option>6th Grade</option>
                    <option>7th Grade</option>
                    <option>8th Grade</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lessons per Week</label>
                <select
                  value={autoScheduleForm.lessonsPerWeek}
                  onChange={(e) => setAutoScheduleForm({ ...autoScheduleForm, lessonsPerWeek: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="2">2 lessons</option>
                  <option value="3">3 lessons</option>
                  <option value="4">4 lessons</option>
                  <option value="5">5 lessons</option>
                </select>
              </div>
              <button
                onClick={autoScheduleLessons}
                disabled={!autoScheduleForm.topic || isScheduling}
                className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isScheduling ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate & Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Item Details Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {viewingItem.type === "assignment" || viewingItem.title.startsWith("📝") ? (
                  <><ClipboardList className="h-5 w-5 text-orange-600" /> Assignment Details</>
                ) : (
                  <><BookOpen className="h-5 w-5 text-blue-600" /> Lesson Details</>
                )}
              </h2>
              <button onClick={() => setViewingItem(null)} className="text-slate-500 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{viewingItem.title.replace("📝 ", "")}</h3>
                <div className="flex flex-wrap gap-2 mt-2 text-sm">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">{viewingItem.subject}</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">{new Date(viewingItem.date).toLocaleDateString()}</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">{viewingItem.time}</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">{viewingItem.duration}</span>
                </div>
              </div>

              {/* Show Assignment Details */}
              {viewingItem.assignmentId && (() => {
                const assignment = assignments.find(a => a.id === viewingItem.assignmentId);
                if (assignment) return (
                  <div className="space-y-3">
                    {assignment.description && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Description</h4>
                        <p className="text-slate-600 dark:text-slate-400">{assignment.description}</p>
                      </div>
                    )}
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Rubric ({assignment.totalPoints} pts total)</h4>
                      <div className="space-y-2">
                        {assignment.rubricCriteria.map((c, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-white dark:bg-slate-600 rounded-lg">
                            <span className="text-slate-900 dark:text-white">{c.name}</span>
                            <span className="text-blue-600 font-semibold">{c.points} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
                return null;
              })()}

              {/* Show Lesson Plan Details */}
              {viewingItem.lessonPlanId && (() => {
                const plan = savedPlans.find(p => p.id === viewingItem.lessonPlanId);
                if (plan) return (
                  <div className="space-y-3">
                    <div className="flex gap-2 text-sm">
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">{plan.grade}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl max-h-[300px] overflow-auto">
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Lesson Plan Content</h4>
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-slate-600 dark:text-slate-400 text-sm font-sans">{plan.content}</pre>
                      </div>
                    </div>
                  </div>
                );
                return null;
              })()}

              {/* If no linked data, show basic info */}
              {!viewingItem.assignmentId && !viewingItem.lessonPlanId && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center text-slate-500 dark:text-slate-400">
                  <p>This is a scheduled item without additional details.</p>
                  <p className="text-sm mt-1">Create items from the Lessons or Assignments tab to include full details.</p>
                </div>
              )}

              <button
                onClick={() => setViewingItem(null)}
                className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevWeek} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{monthYear}</h2>
          <button onClick={nextWeek} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-8 gap-1">
          {/* Time column header */}
          <div className="p-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Time</div>
          {/* Day headers */}
          {weekDates.map((date, i) => (
            <div key={i} className="p-2 text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400">{daysOfWeek[i]}</div>
              <div className={`text-lg font-semibold ${formatDate(date) === formatDate(new Date()) ? "text-blue-600" : "text-slate-900 dark:text-white"}`}>
                {date.getDate()}
              </div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((time, timeIndex) => (
            <div key={`row-${time}`} className="contents">
              <div className="p-2 text-xs text-slate-500 dark:text-slate-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {time}
              </div>
              {weekDates.map((date, dayIndex) => {
                const lessons = getLessonsForSlot(date, time);
                return (
                  <div
                    key={`${dayIndex}-${time}`}
                    className="min-h-[60px] p-1 border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50"
                  >
                    {lessons.map((lesson) => {
                      const isAssignment = lesson.type === "assignment" || lesson.title.startsWith("📝");
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => setViewingItem(lesson)}
                          className={`p-2 rounded-lg text-xs group relative cursor-pointer hover:ring-2 hover:ring-offset-1 ${
                            isAssignment
                              ? "bg-orange-100 dark:bg-orange-900/50 hover:ring-orange-400"
                              : "bg-blue-100 dark:bg-blue-900/50 hover:ring-blue-400"
                          }`}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemoveLesson(lesson.id); }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition z-10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className={`font-medium truncate ${isAssignment ? "text-orange-800 dark:text-orange-200" : "text-blue-800 dark:text-blue-200"}`}>
                            {lesson.title}
                          </div>
                          <div className={isAssignment ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"}>
                            {lesson.duration}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Lessons List */}
      {scheduledLessons.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Scheduled Lessons</h3>
          <div className="space-y-2">
            {scheduledLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{lesson.title}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {lesson.subject} • {new Date(lesson.date).toLocaleDateString()} at {lesson.time}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveLesson(lesson.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CanvasTab() {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CanvasCourse | null>(null);
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<CanvasAssignment | null>(null);
  const [submissions, setSubmissions] = useState<CanvasSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<CanvasSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [gradeInput, setGradeInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [isAutoGrading, setIsAutoGrading] = useState(false);
  const [autoGradeFeedback, setAutoGradeFeedback] = useState("");

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/canvas?action=courses");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCourses(data.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async (courseId: number) => {
    setIsLoading(true);
    setAssignments([]);
    setSelectedAssignment(null);
    setSubmissions([]);
    try {
      const res = await fetch(`/api/canvas?action=assignments&courseId=${courseId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (courseId: number, assignmentId: number) => {
    setIsLoading(true);
    setSubmissions([]);
    setSelectedSubmission(null);
    try {
      const res = await fetch(`/api/canvas?action=submissions&courseId=${courseId}&assignmentId=${assignmentId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = (course: CanvasCourse) => {
    setSelectedCourse(course);
    setSelectedAssignment(null);
    setSubmissions([]);
    fetchAssignments(course.id);
  };

  const handleAssignmentSelect = (assignment: CanvasAssignment) => {
    setSelectedAssignment(assignment);
    if (selectedCourse) {
      fetchSubmissions(selectedCourse.id, assignment.id);
    }
  };

  const handlePostGrade = async () => {
    if (!selectedCourse || !selectedAssignment || !selectedSubmission) return;
    setIsGrading(true);
    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "postGrade",
          courseId: selectedCourse.id,
          assignmentId: selectedAssignment.id,
          studentId: selectedSubmission.user_id,
          grade: gradeInput,
          comment: commentInput,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Refresh submissions
      fetchSubmissions(selectedCourse.id, selectedAssignment.id);
      setGradeInput("");
      setCommentInput("");
      setSelectedSubmission(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post grade");
    } finally {
      setIsGrading(false);
    }
  };

  const handleAutoGrade = async () => {
    if (!selectedSubmission?.body || !selectedAssignment) return;
    setIsAutoGrading(true);
    setAutoGradeFeedback("");
    try {
      const rubricText = selectedAssignment.rubric
        ? selectedAssignment.rubric.map(r => `${r.description} (${r.points} pts)`).join("\n")
        : `Total points: ${selectedAssignment.points_possible}`;

      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentWork: selectedSubmission.body,
          rubric: rubricText,
          assignmentType: selectedAssignment.name,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAutoGradeFeedback(data.feedback);
      // Extract grade from feedback if possible
      const gradeMatch = data.feedback.match(/(\d+)\s*\/\s*(\d+)/);
      if (gradeMatch) {
        setGradeInput(gradeMatch[1]);
      }
      setCommentInput(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto-grade failed");
    } finally {
      setIsAutoGrading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Canvas LMS</h1>
          <p className="text-slate-600 dark:text-slate-400">Grade assignments and sync with Canvas</p>
        </div>
        <button
          onClick={fetchCourses}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
          {error}
          <button onClick={() => setError("")} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Your Courses</h3>
          {isLoading && courses.length === 0 ? (
            <p className="text-slate-500">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-slate-500">No courses found. Make sure you have teacher access.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className={`w-full text-left p-3 rounded-xl transition ${
                    selectedCourse?.id === course.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{course.name}</p>
                  <p className="text-sm text-slate-500">{course.course_code}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assignments */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
            {selectedCourse ? `Assignments - ${selectedCourse.name}` : "Select a Course"}
          </h3>
          {!selectedCourse ? (
            <p className="text-slate-500">Select a course to view assignments</p>
          ) : assignments.length === 0 ? (
            <p className="text-slate-500">{isLoading ? "Loading..." : "No assignments found"}</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {assignments.map((assignment) => (
                <button
                  key={assignment.id}
                  onClick={() => handleAssignmentSelect(assignment)}
                  className={`w-full text-left p-3 rounded-xl transition ${
                    selectedAssignment?.id === assignment.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{assignment.name}</p>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span className="text-blue-600">{assignment.points_possible} pts</span>
                    {assignment.due_at && (
                      <span className="text-slate-500">Due: {new Date(assignment.due_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submissions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
            {selectedAssignment ? `Submissions - ${selectedAssignment.name}` : "Select an Assignment"}
          </h3>
          {!selectedAssignment ? (
            <p className="text-slate-500">Select an assignment to view submissions</p>
          ) : submissions.length === 0 ? (
            <p className="text-slate-500">{isLoading ? "Loading..." : "No submissions yet"}</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => { setSelectedSubmission(sub); setGradeInput(sub.score?.toString() || ""); }}
                  className={`w-full text-left p-3 rounded-xl transition ${
                    selectedSubmission?.id === sub.id
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{sub.user?.name || `Student ${sub.user_id}`}</p>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span className={sub.workflow_state === "submitted" ? "text-green-600" : "text-orange-600"}>
                      {sub.workflow_state}
                    </span>
                    {sub.score !== null && (
                      <span className="text-blue-600">{sub.score}/{selectedAssignment.points_possible}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grading Panel */}
      {selectedSubmission && (
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
            Grade: {selectedSubmission.user?.name || `Student ${selectedSubmission.user_id}`}
          </h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Student Work</h4>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl max-h-[300px] overflow-auto">
                {selectedSubmission.body ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedSubmission.body }} className="prose dark:prose-invert text-sm" />
                ) : selectedSubmission.attachments?.length ? (
                  <div className="space-y-2">
                    {selectedSubmission.attachments.map((att, i) => (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <Download className="h-4 w-4" />
                        {att.filename}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No submission content</p>
                )}
              </div>
              {selectedSubmission.body && (
                <button
                  onClick={handleAutoGrade}
                  disabled={isAutoGrading}
                  className="mt-3 w-full bg-purple-600 text-white py-2 rounded-xl font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {isAutoGrading ? "Analyzing..." : "AI Auto-Grade"}
                </button>
              )}
            </div>
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Grade (out of {selectedAssignment?.points_possible})
                  </label>
                  <input
                    type="number"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    max={selectedAssignment?.points_possible}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Feedback Comment</label>
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-0 resize-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter feedback for student..."
                  />
                </div>
                <button
                  onClick={handlePostGrade}
                  disabled={isGrading || !gradeInput}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {isGrading ? "Posting..." : "Post Grade to Canvas"}
                </button>
              </div>
              {autoGradeFeedback && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">AI Feedback</h4>
                  <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{autoGradeFeedback}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
