import React, { useState, useEffect } from "react";
import {
  Users,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  HelpCircle,
  Activity,
  Sparkles,
  Check,
  CheckCircle,
  Plus,
  Search,
  UserPlus,
  Settings,
  BookOpen,
  FileText,
  ChevronRight,
  Copy,
  RotateCcw,
  Sliders,
  Calendar,
  Flame,
  Award,
  Trash2,
  X,
  Target
} from "lucide-react";

export interface WeakStudent {
  id: string;
  name: string;
  email: string;
  predictedScore: number;
  criticalIssue: string;
  remedyAction: string;
  remedyStatus: "pending" | "dispatched" | "completed";
  // Expanded Learning DNA features for student detail card
  style: "Visual" | "Verbal" | "Auditory" | "Kinesthetic" | "Read/Write";
  speed: "Gentle" | "Moderate" | "Aggressive" | "Slow & Steady" | "Fast-Paced";
  strengths: string[];
  weaknesses: string[];
  xp: number;
  streak: number;
  lastActive: string;
  teacherId?: string | null;
}

export interface TeacherDashboardProps {
  students?: WeakStudent[];
  teacherConfig?: {
    classroomVibe: string;
    targetBaseline: number;
    retrievalInterval: number;
    automatedIntervention: boolean;
  };
  onUpdateConfig?: (newConfig: any) => Promise<void>;
  onAddStudent?: (student: Omit<WeakStudent, "id">) => Promise<void>;
  onDeleteStudent?: (id: string) => Promise<void>;
  onUpdateStudent?: (id: string, fields: Partial<WeakStudent>) => Promise<void>;
}


const INITIAL_STUDENTS: WeakStudent[] = [
  {
    id: "s1",
    name: "Alex Rivera",
    email: "alex.r@academy.edu",
    predictedScore: 68,
    criticalIssue: "Forgetting Binary Trees inside 24 hours due to low active retrieval loops.",
    remedyAction: "Automated custom visual reminder sequence dispatched to their profile.",
    remedyStatus: "dispatched",
    style: "Visual",
    speed: "Moderate",
    strengths: ["Array traversal", "Python Syntax", "Logical Deduction"],
    weaknesses: ["Recursion base-cases", "Binary Trees", "Pointer operations"],
    xp: 2450,
    streak: 8,
    lastActive: "2 hours ago"
  },
  {
    id: "s2",
    name: "Clara Zhang",
    email: "clara.z@academy.edu",
    predictedScore: 54,
    criticalIssue: "High frustration detected on Calculus Integrals recursion loop sessions.",
    remedyAction: "Down-convert target difficulty to Easy with real-life library metaphors.",
    remedyStatus: "pending",
    style: "Kinesthetic",
    speed: "Gentle",
    strengths: ["Interactive widgets", "Object Oriented Design", "Debugging"],
    weaknesses: ["Theoretical integrals", "Matrix projections", "Math definitions"],
    xp: 1120,
    streak: 2,
    lastActive: "1 day ago"
  },
  {
    id: "s3",
    name: "Marcus Vance",
    email: "marcus.v@academy.edu",
    predictedScore: 89,
    criticalIssue: "Over-study syndrome. Streak length indicates high cognitive burnout risk.",
    remedyAction: "Enforced 30-minute mindfulness break logic on dashboard.",
    remedyStatus: "completed",
    style: "Verbal",
    speed: "Aggressive",
    strengths: ["Graph Algorithms", "Data Structure Complexity", "C++ templates"],
    weaknesses: ["Syntax edge-cases", "UI integrations", "Pacing"],
    xp: 5800,
    streak: 19,
    lastActive: "10 mins ago"
  }
];

const INITIAL_MISTAKES = [
  { topic: "Recursion Mechanics", mistake: "Forgetting the exit base case, causing stack limit exhaustion.", frequency: "72% of class", rank: "Critical" },
  { topic: "Eigenvalue Projections", mistake: "Struggling to visualize matrix transform direction stability.", frequency: "58% of class", rank: "High" },
  { topic: "BST Balancing", mistake: "Applying static trees to ordered lists, ruining O(log N) speeds.", frequency: "45% of class", rank: "Medium" }
];

export default function TeacherDashboard({
  students: propStudents,
  teacherConfig: propConfig,
  onUpdateConfig,
  onAddStudent,
  onDeleteStudent,
  onUpdateStudent
}: TeacherDashboardProps = {}) {
  // Local state fallbacks if props are not provided
  const [localStudents, setLocalStudents] = useState<WeakStudent[]>(INITIAL_STUDENTS);
  const students = propStudents !== undefined ? propStudents : localStudents;

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Set initial selection
  useEffect(() => {
    if (students.length > 0 && (!selectedStudentId || !students.some(s => s.id === selectedStudentId))) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const [activeSubTab, setActiveSubTab] = useState<"roster" | "generator" | "heatmap" | "config">("roster");
  
  // Roster search and filters
  const [rosterSearch, setRosterSearch] = useState("");
  const [filterStyle, setFilterStyle] = useState<string>("All");

  // Custom Student Modal Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentScore, setNewStudentScore] = useState(70);
  const [newStudentIssue, setNewStudentIssue] = useState("");
  const [newStudentStyle, setNewStudentStyle] = useState<WeakStudent["style"]>("Visual");
  const [newStudentSpeed, setNewStudentSpeed] = useState<WeakStudent["speed"]>("Moderate");

  // Mistakes Heatmap state
  const [mistakes, setMistakes] = useState(INITIAL_MISTAKES);
  const [isAddMistakeOpen, setIsAddMistakeOpen] = useState(false);
  const [newMistakeTopic, setNewMistakeTopic] = useState("");
  const [newMistakeDesc, setNewMistakeDesc] = useState("");
  const [newMistakeFreq, setNewMistakeFreq] = useState("30% of class");
  const [newMistakeRank, setNewMistakeRank] = useState("Medium");

  // AI Generator state
  const [genTopic, setGenTopic] = useState("Recursion Mechanics");
  const [genCohort, setGenCohort] = useState("At-Risk Students (Score < 70%)");
  const [genType, setGenType] = useState("Metaphor Cheat-Sheet");
  const [genDifficulty, setGenDifficulty] = useState("Introductory");
  const [generatedResource, setGeneratedResource] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Classroom settings local states (fallback)
  const [localTargetBaseline, setLocalTargetBaseline] = useState(75);
  const [localRetrievalInterval, setLocalRetrievalInterval] = useState(24);
  const [localAutomatedIntervention, setLocalAutomatedIntervention] = useState(true);
  const [localClassroomVibe, setLocalClassroomVibe] = useState("Focused & Adaptive");

  const targetBaseline = propConfig ? propConfig.targetBaseline : localTargetBaseline;
  const retrievalInterval = propConfig ? propConfig.retrievalInterval : localRetrievalInterval;
  const automatedIntervention = propConfig ? propConfig.automatedIntervention : localAutomatedIntervention;
  const classroomVibe = propConfig ? propConfig.classroomVibe : localClassroomVibe;

  const updateConfigField = async (field: string, value: any) => {
    if (onUpdateConfig) {
      const updatedConfig = {
        classroomVibe,
        targetBaseline,
        retrievalInterval,
        automatedIntervention,
        [field]: value
      };
      await onUpdateConfig(updatedConfig);
    } else {
      if (field === "classroomVibe") setLocalClassroomVibe(value);
      if (field === "targetBaseline") setLocalTargetBaseline(value);
      if (field === "retrievalInterval") setLocalRetrievalInterval(value);
      if (field === "automatedIntervention") setLocalAutomatedIntervention(value);
    }
  };

  // Action Dispatch Handlers
  const handleDispatchIntervention = async (id: string) => {
    const remedyAction = "Tailored educational psychology trigger dispatched. Course material scaled down 1 difficulty level.";
    if (onUpdateStudent) {
      await onUpdateStudent(id, {
        remedyStatus: "dispatched",
        remedyAction
      });
    } else {
      setLocalStudents((prev) =>
        prev.map((student) =>
          student.id === id
            ? {
                ...student,
                remedyStatus: "dispatched",
                remedyAction
              }
            : student
        )
      );
    }
  };

  const handleResolveIntervention = async (id: string) => {
    const targetStudent = students.find(s => s.id === id);
    const updatedScore = targetStudent ? Math.min(100, targetStudent.predictedScore + 8) : 78;
    const remedyAction = "Retention checks validated. Base cognitive load fully re-balanced.";
    
    if (onUpdateStudent) {
      await onUpdateStudent(id, {
        remedyStatus: "completed",
        predictedScore: updatedScore,
        remedyAction
      });
    } else {
      setLocalStudents((prev) =>
        prev.map((student) =>
          student.id === id
            ? {
                ...student,
                remedyStatus: "completed",
                predictedScore: updatedScore,
                remedyAction
              }
            : student
        )
      );
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;

    const studentData = {
      name: newStudentName,
      email: newStudentEmail,
      predictedScore: Number(newStudentScore),
      criticalIssue: newStudentIssue || "No immediate bottlenecks identified. Mastery decay tracker active.",
      remedyAction: "Awaiting baseline evaluation.",
      remedyStatus: "pending" as const,
      style: newStudentStyle,
      speed: newStudentSpeed,
      strengths: ["Core definitions", "General comprehension"],
      weaknesses: ["Edge cases", "High-complexity synthesis"],
      xp: 150,
      streak: 1,
      lastActive: "Just joined"
    };

    if (onAddStudent) {
      await onAddStudent(studentData);
    } else {
      const newStudent: WeakStudent = {
        id: `s_${Date.now()}`,
        ...studentData
      };
      setLocalStudents(prev => [...prev, newStudent]);
      setSelectedStudentId(newStudent.id);
    }
    
    setIsAddModalOpen(false);
    // Reset Form
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentScore(70);
    setNewStudentIssue("");
    setNewStudentStyle("Visual");
    setNewStudentSpeed("Moderate");
  };

  const handleDeleteStudent = async (id: string) => {
    if (onDeleteStudent) {
      await onDeleteStudent(id);
    } else {
      setLocalStudents(prev => prev.filter(s => s.id !== id));
    }
    if (selectedStudentId === id) {
      const remaining = students.filter(s => s.id !== id);
      setSelectedStudentId(remaining[0]?.id || null);
    }
  };


  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMistakeTopic || !newMistakeDesc) return;
    setMistakes(prev => [
      ...prev,
      {
        topic: newMistakeTopic,
        mistake: newMistakeDesc,
        frequency: newMistakeFreq,
        rank: newMistakeRank
      }
    ]);
    setIsAddMistakeOpen(false);
    setNewMistakeTopic("");
    setNewMistakeDesc("");
  };

  const handleDeleteMistake = (topic: string) => {
    setMistakes(prev => prev.filter(m => m.topic !== topic));
  };

  // AI Study Guide Generator Dispatch
  const handleGenerateResource = async () => {
    setIsGenerating(true);
    setGeneratedResource("");
    try {
      const response = await fetch("/api/teacher/generate-resource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicName: genTopic,
          targetGroup: genCohort,
          resourceType: genType,
          difficulty: genDifficulty
        })
      });
      const data = await response.json();
      setGeneratedResource(data.resource);
    } catch (err) {
      console.error(err);
      setGeneratedResource(`### Error Generating Resource\nAn error occurred while connecting to MentorMind AI. Please try again!`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyResource = () => {
    navigator.clipboard.writeText(generatedResource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Filter roster
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(rosterSearch.toLowerCase()) || 
                          s.email.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                          s.criticalIssue.toLowerCase().includes(rosterSearch.toLowerCase());
    const matchesStyle = filterStyle === "All" || s.style === filterStyle;
    return matchesSearch && matchesStyle;
  });

  return (
    <div id="teacher-dashboard" className="glass border border-white/10 rounded-3xl p-6 text-slate-100 flex flex-col gap-6 shadow-xl h-full relative overflow-hidden">
      
      {/* Visual background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
            <GraduationCap className="text-cyan-400 w-6 h-6" />
            Instructor Control & Analytics Panel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time mental load diagnostic loops, adaptive roster, and AI handout creator
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Vibe: {classroomVibe}
          </span>
          <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            TEACHER TELEMETRY ACTIVE
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
        <div className="bg-black/40 p-4 rounded-2xl border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all duration-200">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Class Roster</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{students.length} Enrolled</div>
          </div>
        </div>

        <div className="bg-black/40 p-4 rounded-2xl border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all duration-200">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Avg. Score</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {students.length > 0
                ? (students.reduce((acc, s) => acc + s.predictedScore, 0) / students.length).toFixed(1)
                : "0"}%
            </div>
          </div>
        </div>

        <div className="bg-black/40 p-4 rounded-2xl border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all duration-200">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className={`w-5 h-5 ${students.some(s => s.remedyStatus === "pending") ? "animate-bounce" : ""}`} />
          </div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Pending Interventions</div>
            <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
              {students.filter(s => s.remedyStatus === "pending").length} Critical
            </div>
          </div>
        </div>

        <div className="bg-black/40 p-4 rounded-2xl border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all duration-200">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Target Baseline</div>
            <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">{targetBaseline}% Score</div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 relative z-10 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab("roster")}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubTab === "roster"
              ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/15"
              : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>
            <span className="hidden md:inline">Class </span>Roster<span className="hidden sm:inline"> &amp; Interventions</span>
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab("generator")}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubTab === "generator"
              ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/15"
              : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>
            AI <span className="hidden md:inline">Remediation </span>Handout<span className="hidden sm:inline"> Studio</span>
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab("heatmap")}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubTab === "heatmap"
              ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/15"
              : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>
            <span className="hidden md:inline">Common </span>Mistakes<span className="hidden sm:inline"> Heatmap</span>
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab("config")}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubTab === "config"
              ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/15"
              : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>
            <span className="hidden md:inline">Adaptive </span>Parameters
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="relative z-10 flex-1">
        
        {/* SUBTAB 1: Class Roster & Interventions */}
        {activeSubTab === "roster" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: Students List */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search roster or issues..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-slate-100 placeholder-slate-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStyle}
                    onChange={(e) => setFilterStyle(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 font-mono"
                  >
                    <option value="All">All Styles</option>
                    <option value="Visual">Visual</option>
                    <option value="Verbal">Verbal</option>
                    <option value="Auditory">Auditory</option>
                    <option value="Kinesthetic">Kinesthetic</option>
                  </select>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Student</span>
                  </button>
                </div>
              </div>

              {/* Roster Container */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const isSelected = selectedStudentId === student.id;
                    return (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-500/40 text-slate-100 shadow-sm"
                            : "bg-white/5 border-white/10 hover:border-white/20 text-slate-200"
                        }`}
                      >
                        <div className="space-y-1.5 w-full md:max-w-[65%]">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-xs font-bold text-white">{student.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono truncate">{student.email}</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                              student.predictedScore >= 80 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                              student.predictedScore >= 60 ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                              "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                            }`}>
                              Score: {student.predictedScore}%
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                            <span className="font-bold text-slate-500">Alert:</span> {student.criticalIssue}
                          </p>

                          <div className="flex gap-2 items-center">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                              {student.style} Style
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                              {student.speed} Pace
                            </span>
                          </div>
                        </div>

                        {/* Intervention Status Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t border-white/5 pt-2 md:border-none md:pt-0">
                          {student.remedyStatus === "pending" ? (
                            <button
                              id={`dispatch-remedy-${student.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDispatchIntervention(student.id);
                              }}
                              className="bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              Dispatch Remedy
                            </button>
                          ) : student.remedyStatus === "dispatched" ? (
                            <button
                              id={`resolve-remedy-${student.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolveIntervention(student.id);
                              }}
                              className="bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer hover:text-amber-300"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              Active (Click to Resolve)
                            </button>
                          ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Resolved
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStudent(student.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer"
                            title="Delete student from roster"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-black/10 rounded-2xl border border-dashed border-white/10 text-slate-500 text-xs italic">
                    No students match the search criteria or learning style filter.
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Student Learning DNA Deep-Dive Panel */}
            <div className="lg:col-span-5">
              {selectedStudent ? (
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                  
                  {/* Title Bar */}
                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedStudent.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{selectedStudent.email}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-mono text-slate-500">Cognitive Load Index</span>
                      <span className="text-xs font-bold font-mono text-cyan-400">{selectedStudent.predictedScore >= 85 ? "Optimal" : selectedStudent.predictedScore >= 65 ? "Strained" : "Critical Overload"}</span>
                    </div>
                  </div>

                  {/* Learning Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                      <Flame className="w-4 h-4 text-orange-400 mb-1" />
                      <span className="text-[8px] uppercase font-mono text-slate-500">Streak</span>
                      <span className="text-xs font-bold text-white font-mono">{selectedStudent.streak} days</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                      <Award className="w-4 h-4 text-cyan-400 mb-1" />
                      <span className="text-[8px] uppercase font-mono text-slate-500">Total XP</span>
                      <span className="text-xs font-bold text-white font-mono">{selectedStudent.xp} XP</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                      <Calendar className="w-4 h-4 text-fuchsia-400 mb-1" />
                      <span className="text-[8px] uppercase font-mono text-slate-500">Last Active</span>
                      <span className="text-[10px] font-bold text-white truncate max-w-full">{selectedStudent.lastActive}</span>
                    </div>
                  </div>

                  {/* Core Diagnostic Callout */}
                  <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-1">
                    <span className="text-[8px] font-bold uppercase tracking-wider font-mono text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" /> Critical Learning Bottleneck
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-300">{selectedStudent.criticalIssue}</p>
                  </div>

                  {/* Psych Profile Fields */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-1">Learning DNA Properties</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                          <span className="text-slate-500">Style Profile:</span>
                          <span className="font-bold text-cyan-400 font-mono">{selectedStudent.style}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                          <span className="text-slate-500">Assimilation Pace:</span>
                          <span className="font-bold text-cyan-400 font-mono">{selectedStudent.speed}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-1">Cognitive Strengths</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedStudent.strengths.map((st, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 font-mono">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-1">Active Weaknesses / Hurdles</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedStudent.weaknesses.map((wk, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400 font-mono">
                            {wk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Action Trigger logged for Student */}
                  <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Active Intervention State</span>
                    <span className={`text-[10px] font-mono font-bold uppercase ${
                      selectedStudent.remedyStatus === "pending" ? "text-rose-400" :
                      selectedStudent.remedyStatus === "dispatched" ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {selectedStudent.remedyStatus}
                    </span>
                  </div>

                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-black/20 border border-dashed border-white/10 text-center text-slate-500 text-xs italic">
                  Select a student from the roster list on the left to inspect their cognitive learning profile.
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUBTAB 2: AI Remediation Handout Studio */}
        {activeSubTab === "generator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side: Generator Controls */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-cyan-400">Handout Studio Controls</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Generate high-impact, custom lessons, syllabus checklists, or analogies directly connected to our active concepts.
              </p>

              <div className="space-y-3.5">
                {/* Topic Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Target Concept Domain</label>
                  <select
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  >
                    <option value="Recursion Mechanics">Recursion Mechanics</option>
                    <option value="Eigenvalue Projections">Eigenvalue Projections</option>
                    <option value="BST Balancing">BST Balancing</option>
                    <option value="Calculus Integrals">Calculus Integrals</option>
                    <option value="Binary Search Trees">Binary Search Trees</option>
                    <option value="Memory Retention Models">Memory Retention Models</option>
                  </select>
                </div>

                {/* Cohort Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Target Student Cohort</label>
                  <select
                    value={genCohort}
                    onChange={(e) => setGenCohort(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  >
                    <option value="At-Risk Students (Score < 70%)">At-Risk Students (Score &lt; 70%)</option>
                    <option value="Visual Learners (Needs diagrams/trees)">Visual Learners (Needs diagrams/trees)</option>
                    <option value="High Performers (Needs complex challenges)">High Performers (Needs complex challenges)</option>
                    <option value="Classwide General Population">Classwide General Population</option>
                  </select>
                </div>

                {/* Resource Category Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Resource Category</label>
                  <select
                    value={genType}
                    onChange={(e) => setGenType(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  >
                    <option value="Metaphor Cheat-Sheet">Metaphor Cheat-Sheet (Bypasses active blockages)</option>
                    <option value="Syllabus Mastery Checklist">Syllabus Mastery Checklist (Aids retention schedule)</option>
                    <option value="Adaptive Practice Sheet">Adaptive Practice Sheet (Hands-on exercise)</option>
                  </select>
                </div>

                {/* Difficulty Tier */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Target Difficulty Tier</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {["Introductory", "Midterm Level", "Technical Interview"].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setGenDifficulty(diff)}
                        className={`py-2 rounded-xl text-[10px] font-bold font-mono transition-all border cursor-pointer ${
                          genDifficulty === diff
                            ? "bg-cyan-500 text-black border-cyan-400"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateResource}
                  disabled={isGenerating}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-black animate-pulse" />
                  {isGenerating ? "Generating Handout..." : "Compile AI Remediation Handout"}
                </button>
              </div>
            </div>

            {/* Right side: Generated Resource Display Container */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-black/40 border border-white/10 min-h-[420px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Compiled Resource Output</span>
                  </div>
                  {generatedResource && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyResource}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? "Copied!" : "Copy Markdown"}
                      </button>
                    </div>
                  )}
                </div>

                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <Sparkles className="w-4 h-4 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-cyan-400 animate-pulse font-mono uppercase tracking-wider">Consulting Gemini Mind Engine</p>
                      <p className="text-[10px] text-slate-500 max-w-sm leading-relaxed">Formulating pedagogical insights tailored specifically for your target student profile...</p>
                    </div>
                  </div>
                ) : generatedResource ? (
                  <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto pr-1 select-text bg-white/5 p-4 rounded-xl border border-white/5 font-mono">
                    {generatedResource}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                    <div className="p-3 rounded-full bg-white/5 text-slate-400 border border-white/5">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">No Resource Compiled Yet</p>
                      <p className="text-[10px] text-slate-500 max-w-xs mt-1">Select your parameter criteria on the left, then click compile to generate tailored resources via MentorMind AI.</p>
                    </div>
                  </div>
                )}
              </div>

              {generatedResource && !isGenerating && (
                <div className="border-t border-white/5 pt-3 mt-4 text-[10px] text-slate-500 flex justify-between items-center">
                  <span>Compiled via Gemini 3.5 Flash Model</span>
                  <span>Ready to print or dispatch</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUBTAB 3: Common Mistakes Heatmap */}
        {activeSubTab === "heatmap" && (
          <div className="space-y-4">
            
            {/* Header section with add option */}
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-400" /> Topic-Level Frequency Heatmap
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Identified class-wide misconception parameters dynamically analyzed from weekly test score decays.</p>
              </div>
              <button
                onClick={() => setIsAddMistakeOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log Heatmap Trend</span>
              </button>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mistakes.map((mistake, idx) => (
                <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300 relative group">
                  <button
                    onClick={() => handleDeleteMistake(mistake.topic)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete mistake trend"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <span className="text-xs font-bold text-white">{mistake.topic}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        mistake.rank === "Critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/15" :
                        mistake.rank === "High" ? "bg-amber-500/10 text-amber-400 border-amber-500/15" :
                        "bg-cyan-500/10 text-cyan-400 border-cyan-500/15"
                      }`}>
                        {mistake.frequency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-2.5">
                      {mistake.mistake}
                    </p>
                  </div>

                  <div className="text-[9px] text-cyan-400 font-bold mt-4 pt-3 border-t border-white/5 flex items-center gap-1 font-mono uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                    Adaptive remedial pathway locked
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* SUBTAB 4: Parameter Configurations */}
        {activeSubTab === "config" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left Box: Controls */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-cyan-400">Classwide Parameters</h4>
              </div>

              {/* Slider 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Cohort Target Baseline Mastery</span>
                  <span className="font-bold text-cyan-400 font-mono">{targetBaseline}% Score</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={targetBaseline}
                  onChange={(e) => updateConfigField("targetBaseline", Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                />
                <p className="text-[9px] text-slate-500">Triggers proactive warning actions if any student's average predictive index drops below this bar.</p>
              </div>

              {/* Slider 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Memory Retrieval Interval Target</span>
                  <span className="font-bold text-cyan-400 font-mono">{retrievalInterval} hours</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="12"
                  value={retrievalInterval}
                  onChange={(e) => updateConfigField("retrievalInterval", Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                />
                <p className="text-[9px] text-slate-500">The baseline period used by MentorMind's forgetting curve algorithm to suggest daily action checklist items.</p>
              </div>

              {/* Select 1 */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Classroom Atmosphere Vibe</label>
                <select
                  value={classroomVibe}
                  onChange={(e) => updateConfigField("classroomVibe", e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 font-mono"
                >
                  <option value="Focused & Adaptive">Focused & Adaptive</option>
                  <option value="Syllabus Sprint Mode">Syllabus Sprint Mode</option>
                  <option value="Review & Refinement">Review & Refinement</option>
                  <option value="Stress Mitigation Priority">Stress Mitigation Priority</option>
                </select>
              </div>

              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Automated AI Remediator dispatch</span>
                  <span className="text-[9px] text-slate-400">Let MentorMind auto-scale question difficulty upon failure</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfigField("automatedIntervention", !automatedIntervention)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-all duration-200 focus:outline-none border border-white/10 ${
                    automatedIntervention ? "bg-cyan-500" : "bg-white/5"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all transform ${
                    automatedIntervention ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

            </div>

            {/* Right Box: Explainer/Stats Summary */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400">Classroom Metrics Evaluation</h4>
              
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <span className="text-slate-400 block font-bold mb-1">Target Achievement Gap</span>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-400 leading-relaxed">The difference between current class mastery average ({students.length > 0 ? (students.reduce((acc, s) => acc + s.predictedScore, 0) / students.length).toFixed(1) : 0}%) and your set target of {targetBaseline}%.</p>
                    <span className="text-lg font-bold font-mono text-cyan-400 shrink-0 ml-3">
                      {Math.max(0, Number((targetBaseline - (students.length > 0 ? (students.reduce((acc, s) => acc + s.predictedScore, 0) / students.length) : 0)).toFixed(1)))}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <span className="text-slate-400 block font-bold mb-1">Psychological Safety Score</span>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-400 leading-relaxed">Assesses streak consistency, burn-out rate alerts, and positive resolution counts.</p>
                    <span className="text-lg font-bold font-mono text-emerald-400 shrink-0 ml-3">92%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-xs">
                  <span className="text-cyan-400 block font-bold mb-1 font-mono uppercase tracking-wider text-[9px]">Classwide Analytics Synced</span>
                  <p className="text-[10px] text-slate-300 leading-relaxed">These parameters actively modify the backend suggestion queue thresholds, prompting students to take specific micro-tasks as decay triggers occur.</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: Add Student Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0b0e17] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4 text-slate-100">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <UserPlus className="w-4 h-4 text-cyan-400" /> Enroll New Student Profile
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Configure baseline parameters for tracking a student's cognitive learning DNA.</p>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Alex Rivera"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Student Email</label>
                  <input
                    type="email"
                    required
                    placeholder="E.g., alex@academy.edu"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Learning Style</label>
                  <select
                    value={newStudentStyle}
                    onChange={(e) => setNewStudentStyle(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-slate-300"
                  >
                    <option value="Visual">Visual</option>
                    <option value="Verbal">Verbal</option>
                    <option value="Auditory">Auditory</option>
                    <option value="Kinesthetic">Kinesthetic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Learning Pace</label>
                  <select
                    value={newStudentSpeed}
                    onChange={(e) => setNewStudentSpeed(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-slate-300"
                  >
                    <option value="Gentle">Gentle</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Initial Predicted Score ({newStudentScore}%)</label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={newStudentScore}
                  onChange={(e) => setNewStudentScore(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Critical Retention Bottleneck</label>
                <textarea
                  placeholder="E.g., Struggling to grasp recursion base-cases inside active intervals..."
                  value={newStudentIssue}
                  onChange={(e) => setNewStudentIssue(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white placeholder-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Enroll & Sync Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Mistake trend Form */}
      {isAddMistakeOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0b0e17] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-slate-100">
            <button
              onClick={() => setIsAddMistakeOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Plus className="w-4 h-4 text-rose-400" /> Log Misconception Trend
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Log class-wide failure paths detected in exam scripts or practice datasets.</p>
            </div>

            <form onSubmit={handleAddMistake} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Concept Topic</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Recursion exit case"
                  value={newMistakeTopic}
                  onChange={(e) => setNewMistakeTopic(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Failure Trend Description</label>
                <textarea
                  required
                  placeholder="E.g., Students applying static base-case structures to unbalanced binary trees..."
                  value={newMistakeDesc}
                  onChange={(e) => setNewMistakeDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Frequency</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., 65% of class"
                    value={newMistakeFreq}
                    onChange={(e) => setNewMistakeFreq(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Severity Rating</label>
                  <select
                    value={newMistakeRank}
                    onChange={(e) => setNewMistakeRank(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-slate-300"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Log Misconception & Lock Pathway
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
