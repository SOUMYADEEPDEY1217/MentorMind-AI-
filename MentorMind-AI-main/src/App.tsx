import React, { useState, useEffect } from "react";
import { INITIAL_NODES, INITIAL_LINKS, ALL_BADGES } from "./data";
import { KnowledgeNode, StudentProfile, Badge } from "./types";
import KnowledgeGraph3D from "./components/KnowledgeGraph3D";
import StudentProfileView from "./components/StudentProfileView";
import ActiveNodeStudio from "./components/ActiveNodeStudio";
import TeacherDashboard, { WeakStudent } from "./components/TeacherDashboard";
import LifeSaverPlanner from "./components/LifeSaverPlanner";
import AuthScreen from "./components/AuthScreen";
import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  onSnapshot,
  getDoc,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  signOut
} from "./lib/firebase";
import {
  Brain,
  Search,
  Bookmark,
  Sun,
  Moon,
  Sparkles,
  GraduationCap,
  User,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  X,
  Plus,
  Flame,
  Check,
  LogOut
} from "lucide-react";

export default function App() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>(INITIAL_NODES);
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("cs-root");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>(["cs-recursion", "math-eigen"]);
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Multi-subject filter and mobile responsive navigation states
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [mobileSubView, setMobileSubView] = useState<"map" | "studio" | "dna">("map");
  const [activeStudioTab, setActiveStudioTab] = useState<"explain" | "chat" | "quiz">("explain");
  const [prefilledPrompt, setPrefilledPrompt] = useState<string>("");

  // Custom concept / subject creation states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newConceptName, setNewConceptName] = useState("");
  const [newConceptSubject, setNewConceptSubject] = useState("");
  const [newConceptParentId, setNewConceptParentId] = useState("");
  const [newConceptDifficulty, setNewConceptDifficulty] = useState<KnowledgeNode["difficulty"]>("Easy");
  const [newConceptDescription, setNewConceptDescription] = useState("");
  const [customSubjectActive, setCustomSubjectActive] = useState(false);

  // Extract unique subjects dynamically from the active nodes state
  const uniqueSubjects = Array.from(new Set(nodes.map(n => n.subject)));

  // Filter nodes and links based on the active subject filter selection
  const filteredNodes = selectedSubject === "All"
    ? nodes
    : nodes.filter(n => n.subject === selectedSubject);

  const filteredLinks = selectedSubject === "All"
    ? links
    : links.filter(l => {
        const srcId = typeof l.source === "string" ? l.source : (l.source as any).id;
        const tgtId = typeof l.target === "string" ? l.target : (l.target as any).id;
        const sourceNode = nodes.find(n => n.id === srcId);
        const targetNode = nodes.find(n => n.id === tgtId);
        return sourceNode?.subject === selectedSubject && targetNode?.subject === selectedSubject;
      });

  // Filtered nodes for search dropdown
  const searchResults = searchQuery
    ? nodes.filter(
        (n) =>
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Initial personalized student profile using the student name "Rohan Dey"
  const [profile, setProfile] = useState<StudentProfile>({
    name: "Rohan Dey",
    style: "Visual",
    speed: "Moderate",
    strengths: ["Recursive flows", "Algorithmic thinking", "Visual graphs"],
    weaknesses: ["Mathematics definitions", "Binary tree structures"],
    xp: 240,
    level: 3,
    streak: 5,
    badges: [ALL_BADGES[0], ALL_BADGES[4]],
    completedNodes: ["cs-python", "cs-loops", "psy-curve"],
    nodeScores: {
      "cs-python": 70,
      "cs-loops": 95,
      "psy-curve": 95
    },
    lastActive: new Date().toISOString()
  });

  // Auth states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Sync state for Teacher dashboard
  const [teacherConfig, setTeacherConfig] = useState({
    name: "Advisor",
    classroomVibe: "Focused & Adaptive",
    targetBaseline: 75,
    retrievalInterval: 24,
    automatedIntervention: true
  });
  const [teacherStudents, setTeacherStudents] = useState<WeakStudent[]>([]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const r = userDocSnap.data().role as "student" | "teacher";
          setUserRole(r);
          setActiveTab(r);
        } else {
          setUserRole("student");
          setActiveTab("student");
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Student Profile real-time sync
  useEffect(() => {
    if (!currentUser || userRole !== "student") return;

    const profileRef = doc(db, "students", currentUser.uid);
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StudentProfile;
        setProfile(data);
        if (data.bookmarkedNodes) {
          setBookmarks(data.bookmarkedNodes);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, userRole]);

  // Teacher Dashboard real-time sync
  useEffect(() => {
    if (!currentUser || userRole !== "teacher") return;

    const teacherRef = doc(db, "teachers", currentUser.uid);
    const unsubConfig = onSnapshot(teacherRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeacherConfig({
          name: data.name || currentUser.displayName || "Advisor",
          classroomVibe: data.classroomVibe || "Focused & Adaptive",
          targetBaseline: data.targetBaseline || 75,
          retrievalInterval: data.retrievalInterval || 24,
          automatedIntervention: data.automatedIntervention !== undefined ? data.automatedIntervention : true
        });
      }
    });

    const studentsCol = collection(db, "students");
    const q = query(studentsCol, where("teacherId", "==", currentUser.uid));
    const unsubStudents = onSnapshot(q, (querySnapshot) => {
      const roster: any[] = [];
      querySnapshot.forEach((docSnap) => {
        roster.push({ id: docSnap.id, ...docSnap.data() });
      });
      setTeacherStudents(roster);
    });

    return () => {
      unsubConfig();
      unsubStudents();
    };
  }, [currentUser, userRole]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const [selectedDifficulty, setSelectedDifficulty] = useState<KnowledgeNode["difficulty"]>(
    selectedNode?.difficulty || "Easy"
  );

  // Sync selected difficulty when node selection changes
  useEffect(() => {
    if (selectedNode) {
      setSelectedDifficulty(selectedNode.difficulty);
    }
  }, [selectedNodeId]);

  // Update student DNA parameters
  const handleUpdateStyle = async (style: StudentProfile["style"]) => {
    if (currentUser && userRole === "student") {
      await updateDoc(doc(db, "students", currentUser.uid), { style });
    } else {
      setProfile((prev) => ({ ...prev, style }));
    }
  };

  const handleUpdateSpeed = async (speed: StudentProfile["speed"]) => {
    const firestoreSpeed = speed === "Fast-Paced" ? "Fast-Paced" : speed === "Slow & Steady" ? "Slow & Steady" : "Moderate";
    if (currentUser && userRole === "student") {
      await updateDoc(doc(db, "students", currentUser.uid), { speed: firestoreSpeed });
    } else {
      setProfile((prev) => ({ ...prev, speed: firestoreSpeed }));
    }
  };

  const handleAddStrength = async (strength: string) => {
    const updatedStrengths = [...profile.strengths.filter((s) => s !== strength), strength];
    if (currentUser && userRole === "student") {
      await updateDoc(doc(db, "students", currentUser.uid), { strengths: updatedStrengths });
    } else {
      setProfile((prev) => ({
        ...prev,
        strengths: updatedStrengths
      }));
    }
  };

  const handleAddWeakness = async (weakness: string) => {
    const updatedWeaknesses = [...profile.weaknesses.filter((w) => w !== weakness), weakness];
    if (currentUser && userRole === "student") {
      await updateDoc(doc(db, "students", currentUser.uid), { weaknesses: updatedWeaknesses });
    } else {
      setProfile((prev) => ({
        ...prev,
        weaknesses: updatedWeaknesses
      }));
    }
  };

  // Toggle bookmark on node
  const handleBookmarkToggle = async (nodeId: string) => {
    const updatedBookmarks = bookmarks.includes(nodeId)
      ? bookmarks.filter((id) => id !== nodeId)
      : [...bookmarks, nodeId];

    setBookmarks(updatedBookmarks);

    // Give badge for exploring/bookmarking
    let updatedBadges = [...profile.badges];
    if (updatedBookmarks.length >= 3 && !profile.badges.some((b) => b.id === "b5")) {
      updatedBadges.push(ALL_BADGES[4]);
    }

    if (currentUser && userRole === "student") {
      await updateDoc(doc(db, "students", currentUser.uid), { 
        bookmarkedNodes: updatedBookmarks,
        badges: updatedBadges
      });
    } else {
      setProfile((prev) => ({
        ...prev,
        badges: updatedBadges
      }));
    }
  };

  // Give XP and increase mastery on Quiz success
  const handleQuizCompleted = async (earnedXp: number, completedNodeId: string) => {
    const nextXp = profile.xp + earnedXp;
    const calculatedLevel = Math.floor(nextXp / 100) + 1;
    const completedNodes = [...profile.completedNodes.filter((id) => id !== completedNodeId), completedNodeId];

    // Unlock badges based on milestones
    let updatedBadges = [...profile.badges];
    if (completedNodeId === "cs-recursion" && !profile.badges.some((b) => b.id === "b2")) {
      updatedBadges.push(ALL_BADGES[1]);
    }
    if (profile.streak >= 5 && !profile.badges.some((b) => b.id === "b3")) {
      updatedBadges.push(ALL_BADGES[2]);
    }

    if (currentUser && userRole === "student") {
      await updateDoc(doc(db, "students", currentUser.uid), {
        xp: nextXp,
        level: calculatedLevel,
        completedNodes,
        badges: updatedBadges,
        lastActive: new Date().toISOString()
      });
    } else {
      setProfile((prev) => ({
        ...prev,
        xp: nextXp,
        level: calculatedLevel,
        badges: updatedBadges,
        completedNodes,
        lastActive: new Date().toISOString()
      }));
    }

    // Dynamically bump mastery & retention on the completed node
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === completedNodeId
          ? {
              ...n,
              mastery: Math.min(100, n.mastery + 15),
              retention: Math.min(100, n.retention + 25),
              daysUntilForget: Math.min(30, n.daysUntilForget + 5)
            }
          : n
      )
    );
  };

  // Teacher specific mutations
  const handleUpdateTeacherConfig = async (newConfig: any) => {
    if (currentUser && userRole === "teacher") {
      await updateDoc(doc(db, "teachers", currentUser.uid), newConfig);
    }
  };

  const handleAddTeacherStudent = async (studentData: any) => {
    if (currentUser && userRole === "teacher") {
      const studentsCol = collection(db, "students");
      await addDoc(studentsCol, {
        ...studentData,
        teacherId: currentUser.uid
      });
    }
  };

  const handleDeleteTeacherStudent = async (id: string) => {
    if (currentUser && userRole === "teacher") {
      await deleteDoc(doc(db, "students", id));
    }
  };

  const handleUpdateTeacherStudent = async (id: string, fields: any) => {
    if (currentUser && userRole === "teacher") {
      await updateDoc(doc(db, "students", id), fields);
    }
  };

  const handleCreateConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConceptName.trim()) return;

    const subjectName = customSubjectActive ? newConceptSubject.trim() : (newConceptSubject || "Computer Science");
    if (!subjectName) return;

    // Generate unique ID
    const sanitizedSubject = subjectName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const sanitizedName = newConceptName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const nodeId = `custom-${sanitizedSubject}-${sanitizedName}-${Date.now()}`;

    // Find parent node if selected
    const parentNode = nodes.find(n => n.id === newConceptParentId);
    const depth = parentNode ? parentNode.depth + 1 : 0;

    // Assemble new concept node
    const newNode: KnowledgeNode = {
      id: nodeId,
      name: newConceptName.trim(),
      subject: subjectName,
      description: newConceptDescription.trim() || `An adaptive custom concept under ${subjectName}.`,
      parentId: newConceptParentId || undefined,
      depth,
      mastery: 15,
      retention: 60,
      daysUntilForget: 4,
      difficulty: newConceptDifficulty,
      materials: [
        {
          id: `mat-${Date.now()}`,
          title: `${newConceptName.trim()} Essentials`,
          type: "concept",
          content: `Core concepts of ${newConceptName.trim()}. Use the explanation tab to explore deep curriculum content designed by your adaptive learning psychologist, chat in real-time, or test your comprehension inside the Boss Quiz Station!`
        }
      ]
    };

    // Update state
    setNodes(prev => [...prev, newNode]);

    // If there is a parent connection, add a link
    if (newConceptParentId) {
      setLinks(prev => [...prev, { source: newConceptParentId, target: nodeId }]);
    }

    // Automatically select the new concept
    setSelectedNodeId(nodeId);

    // Give some XP reward for active graph customization/creation
    setProfile(prev => {
      const nextXp = prev.xp + 25;
      const calculatedLevel = Math.floor(nextXp / 100) + 1;
      return {
        ...prev,
        xp: nextXp,
        level: calculatedLevel
      };
    });

    // Reset fields & Close modal
    setNewConceptName("");
    setNewConceptSubject("");
    setNewConceptParentId("");
    setNewConceptDifficulty("Easy");
    setNewConceptDescription("");
    setCustomSubjectActive(false);
    setIsAddModalOpen(false);
    setSearchQuery("");
  };

  // Calculate overall class level mastery progress
  const averageMastery = Math.round(
    nodes.reduce((acc, curr) => acc + curr.mastery, 0) / nodes.length
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <p className="text-xs font-mono tracking-widest text-slate-400 uppercase animate-pulse">Syncing Cognitive Core...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div
      id="app-container"
      className={`min-h-screen transition-all duration-300 font-sans relative ${
        theme === "dark"
          ? "bg-[#050505] text-slate-100 selection:bg-indigo-500/30 bg-[radial-gradient(circle_at_50%_50%,#111827,0%,#000,100%)]"
          : "bg-slate-50 text-slate-900 selection:bg-indigo-100"
      }`}
    >
      {/* Decorative ambient grid overlay */}
      {theme === "dark" && (
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none z-0" 
          style={{ 
            backgroundImage: "radial-gradient(#22d3ee 0.5px, transparent 0.5px)", 
            backgroundSize: "32px 32px" 
          }}
        />
      )}

      {/* Primary Top Navigation bar styled with Immersive UI navbar */}
      <header
        id="app-header"
        className={`sticky top-0 z-50 border-b backdrop-blur-md transition-all duration-200 ${
          theme === "dark"
            ? "bg-black/40 border-white/10 text-white"
            : "bg-white/80 border-slate-200 text-slate-950"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg learning-dna-gradient flex items-center justify-center shadow-md shrink-0">
              <div className="w-4 h-4 bg-black/20 rounded-full blur-[1px]"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tighter text-gradient text-sm sm:text-lg uppercase whitespace-nowrap">
                  MentorMind AI
                </span>
                <span className="hidden min-[420px]:inline-block bg-cyan-500/10 text-cyan-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-cyan-500/20 uppercase tracking-widest whitespace-nowrap">
                  Psychologist
                </span>
              </div>
            </div>
          </div>

          {/* Search bar for quick navigation of nodes */}
          <div className="hidden md:flex items-center relative w-72">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search concepts (e.g. Recursion)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-full pl-9 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                theme === "dark"
                  ? "bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:bg-white/10"
                  : "bg-slate-100 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Desktop search suggestion dropdown & Add Concept trigger */}
            {searchQuery && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border p-2.5 z-[999] flex flex-col gap-1 max-h-80 overflow-y-auto ${
                theme === "dark" ? "bg-[#0b0e17] border-white/10 text-slate-200" : "bg-white border-slate-200 text-slate-800"
              }`}>
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 px-2 py-1 border-b border-white/5 mb-1">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((match) => (
                    <button
                      key={match.id}
                      onClick={() => {
                        setSelectedNodeId(match.id);
                        setSearchQuery("");
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-all flex justify-between items-center ${
                        theme === "dark" ? "hover:bg-white/5 text-slate-200" : "hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-gradient-indigo">{match.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono">{match.subject}</div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                        {match.mastery}%
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic px-2 py-2">No existing concepts found.</div>
                )}
                
                <div className="border-t border-white/10 my-1.5"></div>
                
                <button
                  onClick={() => {
                    setNewConceptName(searchQuery);
                    setIsAddModalOpen(true);
                  }}
                  className="w-full text-left p-2 rounded-xl text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1.5 bg-cyan-500/5 border border-cyan-500/10"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create "{searchQuery}" as custom concept</span>
                </button>
              </div>
            )}
          </div>

          {/* Controls & Mode Switches */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            {/* Quick Add Concept Button */}
            <button
              id="open-add-concept-btn"
              onClick={() => {
                setNewConceptName("");
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 rounded-xl border border-transparent bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Add Concept</span>
            </button>

            {/* Non-interactive Space Badge based on Role */}
            {userRole === "student" ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">STUDENT SPACE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EDUCATOR PORTAL</span>
              </div>
            )}

            {/* Role-specific Profile Badge */}
            {userRole === "student" ? (
              <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-4">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Daily Streak</span>
                  <span className="text-xs font-bold text-orange-400">🔥 {profile.streak} DAYS</span>
                </div>
                <div className="w-9 h-9 rounded-full border border-cyan-500/30 p-0.5 overflow-hidden">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0D9488&color=fff`} 
                    className="rounded-full w-full h-full object-cover" 
                    alt="User avatar" 
                  />
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-4">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Instructor</span>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide truncate max-w-[120px]">{teacherConfig.name}</span>
                </div>
                <div className="w-9 h-9 rounded-full border border-amber-500/30 p-0.5 overflow-hidden">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacherConfig.name)}&background=b45309&color=fff`} 
                    className="rounded-full w-full h-full object-cover" 
                    alt="Teacher avatar" 
                  />
                </div>
              </div>
            )}

            {/* Readability Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-xl border transition-all ${
                theme === "dark"
                  ? "bg-white/5 text-yellow-400 border-white/10 hover:bg-white/10"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Sign Out Button */}
            {currentUser && (
              <button
                onClick={() => signOut(auth)}
                className="p-2 rounded-xl border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline text-xs font-semibold">Exit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 min-h-[calc(100vh-112px)]">
        {activeTab === "student" ? (
          /* STUDENT SPACE WORKSPACE */
          <div className="space-y-6">
            {/* Subject Filters (Visible to all, horizontal scrollable) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Subject Domain Filters</span>
                {selectedSubject !== "All" && (
                  <button 
                    onClick={() => setSelectedSubject("All")}
                    className="text-[9px] font-mono font-bold text-cyan-400 hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scroll-smooth whitespace-nowrap">
                {["All", ...uniqueSubjects].map((sub) => {
                  const isSelected = selectedSubject === sub;
                  const count = sub === "All" ? nodes.length : nodes.filter(n => n.subject === sub).length;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer shrink-0 ${
                        isSelected
                          ? "bg-cyan-500 text-black border-cyan-400 font-bold shadow-md shadow-cyan-500/10"
                          : theme === "dark"
                          ? "bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/20 hover:text-slate-100"
                          : "bg-slate-100 border-slate-200 text-slate-700 hover:border-cyan-500/20 hover:bg-slate-200/50"
                      }`}
                    >
                      {sub} <span className={`text-[10px] ml-1.5 font-mono ${isSelected ? "text-cyan-950 font-bold" : "text-slate-500"}`}>({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Sub-View Segmented Tab Selector (Only visible below lg break) */}
            <div className="lg:hidden grid grid-cols-3 gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setMobileSubView("map")}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  mobileSubView === "map"
                    ? "bg-cyan-500 text-black shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Map & Queue</span>
              </button>
              <button
                onClick={() => setMobileSubView("studio")}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 relative ${
                  mobileSubView === "studio"
                    ? "bg-cyan-500 text-black shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Active Studio</span>
                {selectedNode && (
                  <span className="absolute top-2 right-4 w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setMobileSubView("dna")}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  mobileSubView === "dna"
                    ? "bg-cyan-500 text-black shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Learning DNA</span>
              </button>
            </div>

            {/* Mobile Search Bar layout */}
            <div className="flex md:hidden flex-col gap-2 relative">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-full pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                    theme === "dark"
                      ? "bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:bg-white/10"
                      : "bg-slate-100 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              {/* Mobile suggestion results */}
              {searchQuery && (
                <div className={`absolute top-full left-0 right-0 mt-1 rounded-2xl shadow-2xl border p-2.5 z-[999] flex flex-col gap-1 max-h-60 overflow-y-auto ${
                  theme === "dark" ? "bg-[#0b0e17] border-white/10 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                }`}>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 px-2 py-1">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 4).map((match) => (
                      <button
                        key={match.id}
                        onClick={() => {
                          setSelectedNodeId(match.id);
                          setSearchQuery("");
                          setMobileSubView("studio");
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-all flex justify-between items-center ${
                          theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-100"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-cyan-400">{match.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{match.subject}</div>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">
                          {match.mastery}%
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic px-2 py-1.5">No matching concepts found.</div>
                  )}
                  
                  <div className="border-t border-white/10 my-1"></div>
                  
                  <button
                    onClick={() => {
                      setNewConceptName(searchQuery);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1.5 bg-cyan-500/5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create "{searchQuery}" as custom concept</span>
                  </button>
                </div>
              )}
            </div>

            {/* Core Workspace Columns (Responsive) */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-6 lg:space-y-0">
              
              {/* LEFT AREA: Interactive 3D Graph + Studio Console */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Map & Queue Section (Visible on desktop, or mobile when Map tab selected) */}
                <div className={`space-y-6 ${mobileSubView === "map" ? "block" : "hidden lg:block"}`}>
                  
                  {/* 3D Map Widget with Immersive theme wrapper */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1.5 font-mono">
                          <Sparkles className="w-4 h-4" />
                          Live Knowledge Map ({selectedSubject})
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Select nodes to expand nested topics, explore explanations, and access learning materials.
                        </p>
                      </div>
                      {/* Dynamic stats */}
                      <div className="flex gap-2.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        <div>
                          Mastery Index: <strong className="text-cyan-400">{averageMastery}%</strong>
                        </div>
                        <div className="hidden sm:inline">•</div>
                        <div className="hidden sm:inline">
                          Retention Avg: <strong className="text-fuchsia-400">72%</strong>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
                      <KnowledgeGraph3D
                        nodes={filteredNodes}
                        links={filteredLinks}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={(node) => setSelectedNodeId(node.id)}
                        searchQuery={searchQuery}
                        bookmarks={bookmarks}
                      />
                    </div>
                  </div>

                  {/* Life Saver Action Queue (Personalized Daily Planner) */}
                  <LifeSaverPlanner
                    nodes={nodes}
                    selectedSubject={selectedSubject}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                    onTriggerDraft={(node, type) => {
                      if (type === "outline") {
                        setPrefilledPrompt(`Hey MentorMind AI! As a ${profile.style} learner, please draft a 15-minute high-impact study outline for "${node.name}" immediately. Focus on reducing my cognitive activation energy and helping me bypass study procrastination!`);
                      } else if (type === "quiz") {
                        setPrefilledPrompt(`Hey MentorMind AI! Please launch a comprehensive, high-difficulty quiz check on the concept "${node.name}" to help me lock in this memory connection.`);
                      }
                      setActiveStudioTab("chat");
                      setMobileSubView("studio");
                    }}
                    profile={profile}
                    theme={theme}
                  />
                </div>

                {/* 2. Active Studio Console Section (Visible on desktop, or mobile when Studio tab selected) */}
                <div className={`space-y-6 ${mobileSubView === "studio" ? "block" : "hidden lg:block"}`}>
                  <div className="rounded-3xl overflow-hidden shadow-xl border border-white/10 bg-black/30 backdrop-blur-md">
                    <ActiveNodeStudio
                      node={selectedNode}
                      profile={profile}
                      onBookmarkToggle={handleBookmarkToggle}
                      isBookmarked={bookmarks.includes(selectedNodeId)}
                      onQuizCompleted={handleQuizCompleted}
                      selectedDifficulty={selectedDifficulty}
                      onChangeDifficulty={setSelectedDifficulty}
                      activeTab={activeStudioTab}
                      onTabChange={setActiveStudioTab}
                      prefilledPrompt={prefilledPrompt}
                      onClearPrefilledPrompt={() => setPrefilledPrompt("")}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Profile details, Forgetting prediction, Badges (Visible on desktop, or mobile when Learning DNA tab selected) */}
              <div className={`lg:col-span-4 space-y-6 ${mobileSubView === "dna" ? "block" : "hidden lg:block"}`}>
                <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md overflow-hidden shadow-xl">
                  <StudentProfileView
                    profile={profile}
                    selectedNode={selectedNode}
                    onUpdateStyle={handleUpdateStyle}
                    onUpdateSpeed={handleUpdateSpeed}
                    onAddStrength={handleAddStrength}
                    onAddWeakness={handleAddWeakness}
                    allBadges={ALL_BADGES}
                  />
                </div>

                {/* Saved Bookmarks Navigation List */}
                <div className="glass rounded-3xl p-6 text-slate-100 shadow-xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2 font-mono">
                    <Bookmark className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                    Saved Bookmarks ({bookmarks.length})
                  </h3>

                  {bookmarks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {bookmarks.map((bmId) => {
                        const bmNode = nodes.find((n) => n.id === bmId);
                        if (!bmNode) return null;
                        return (
                          <button
                            key={bmId}
                            id={`bookmark-item-${bmId}`}
                            onClick={() => {
                              setSelectedNodeId(bmId);
                              setMobileSubView("studio");
                            }}
                            className={`p-3 rounded-2xl border text-left text-xs transition-all duration-200 flex justify-between items-center cursor-pointer ${
                              selectedNodeId === bmId
                                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                                : "bg-white/5 border-white/10 hover:border-cyan-500/30 text-slate-300"
                            }`}
                          >
                            <div>
                              <div className="font-bold text-white">{bmNode.name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{bmNode.subject}</div>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-cyan-400">
                              {bmNode.mastery}%
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-4">No bookmarked nodes yet. Click the bookmark icon inside study details.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TEACHER SPACE DASHBOARD */
          <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 overflow-hidden bg-black/30 backdrop-blur-md shadow-2xl">
            <TeacherDashboard
              students={teacherStudents}
              teacherConfig={teacherConfig}
              onUpdateConfig={handleUpdateTeacherConfig}
              onAddStudent={handleAddTeacherStudent}
              onDeleteStudent={handleDeleteTeacherStudent}
              onUpdateStudent={handleUpdateTeacherStudent}
            />
          </div>
        )}
      </main>

      {/* Styled Immersive UI Footer */}
      <footer className="h-12 border-t border-white/10 flex flex-col sm:flex-row items-center px-8 bg-black/80 backdrop-blur-md justify-between text-[10px] text-gray-500 uppercase tracking-[0.15em] font-mono py-2 sm:py-0 gap-2 relative z-20">
        <div>
          Psychological state: <span className="text-green-400 font-bold">Focused & Receptive</span>
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> 
            RAG Context Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"></span> 
            Emotion Detection: ON
          </span>
          <span className="text-slate-600 hidden md:inline">Server: Tokyo-GPT-4o</span>
        </div>
      </footer>

      {/* Dynamic Add Concept Dialog/Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#0a0f1d] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-tight">
                  <Plus className="w-4 h-4 text-cyan-400 stroke-[3]" />
                  Add Study Concept or Subject
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Enrich your mind map with personalized study domains.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateConcept} className="space-y-4">
              {/* Concept Name */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Concept Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Quantum Physics, Organic Chem, Microeconomics..."
                  value={newConceptName}
                  onChange={(e) => setNewConceptName(e.target.value)}
                  className="w-full rounded-xl p-2.5 text-xs bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Subject area picker */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Subject Area
                </label>
                
                {!customSubjectActive ? (
                  <div className="flex gap-2">
                    <select
                      value={newConceptSubject}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setCustomSubjectActive(true);
                          setNewConceptSubject("");
                        } else {
                          setNewConceptSubject(e.target.value);
                        }
                      }}
                      className="flex-1 rounded-xl p-2.5 text-xs bg-[#0c101a] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Select Subject --</option>
                      {uniqueSubjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="__new__" className="text-cyan-400 font-bold">+ Create a New Subject...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="E.g., Physics, History, Literature..."
                      value={newConceptSubject}
                      onChange={(e) => setNewConceptSubject(e.target.value)}
                      className="flex-1 rounded-xl p-2.5 text-xs bg-black/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomSubjectActive(false);
                        setNewConceptSubject("");
                      }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Parent Connection picker */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Parent Connection (Optional)
                </label>
                <select
                  value={newConceptParentId}
                  onChange={(e) => setNewConceptParentId(e.target.value)}
                  className="w-full rounded-xl p-2.5 text-xs bg-[#0c101a] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">None (Create as a Root Subject Node)</option>
                  {uniqueSubjects.map(sub => (
                    <optgroup key={sub} label={sub} className="text-slate-500 font-bold bg-[#0a0f1d]">
                      {nodes.filter(n => n.subject === sub).map(node => (
                        <option key={node.id} value={node.id} className="text-slate-300 bg-[#0a0f1d]">
                          {node.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Grid for Difficulty and XP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Target Difficulty
                  </label>
                  <select
                    value={newConceptDifficulty}
                    onChange={(e) => setNewConceptDifficulty(e.target.value as any)}
                    className="w-full rounded-xl p-2.5 text-xs bg-[#0c101a] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Interview-level">Interview-level</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Custom Creation Reward
                  </label>
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-[9px] text-cyan-400 rounded-xl font-mono font-bold flex items-center justify-center h-10">
                    +25 XP Active DNA
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Concept Description
                </label>
                <textarea
                  placeholder="Explain briefly what this concept covers..."
                  value={newConceptDescription}
                  onChange={(e) => setNewConceptDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl p-2.5 text-xs bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Submit / Action buttons */}
              <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs hover:bg-white/5 text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newConceptName.trim() || (!customSubjectActive && !newConceptSubject) || (customSubjectActive && !newConceptSubject.trim())}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-45 text-black font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  Create Concept
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
