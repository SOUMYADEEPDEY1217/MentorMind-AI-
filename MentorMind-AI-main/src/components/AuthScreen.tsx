import React, { useState } from "react";
import { 
  auth,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  db, 
  setDoc, 
  doc, 
  getDocs, 
  collection, 
  query, 
  where, 
  deleteDoc 
} from "../lib/firebase";
import { Brain, GraduationCap, User, Sparkles, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { ALL_BADGES } from "../data";

interface AuthScreenProps {
  onAuthSuccess?: (uid: string, role: "student" | "teacher") => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [role, setRole] = useState<"student" | "teacher">("student");
  
  // Input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Custom Student sign up fields
  const [inviteCode, setInviteCode] = useState("");
  const [gradeLevel, setGradeLevel] = useState("Undergraduate");

  // Custom Teacher sign up fields
  const [schoolName, setSchoolName] = useState("");
  const [department, setDepartment] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const uid = user.uid;
      const userEmail = user.email || "";
      const userName = user.displayName || "Google Explorer";

      // Check if user role document exists
      const userDocRef = doc(db, "users", uid);
      const { getDoc } = await import("../lib/firebase");
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (onAuthSuccess) {
          onAuthSuccess(uid, userData.role as "student" | "teacher");
        }
      } else {
        // New user registration via Google!
        // Save user role record
        await setDoc(doc(db, "users", uid), {
          uid,
          email: userEmail,
          name: userName,
          role,
          createdAt: new Date().toISOString()
        });

        if (role === "student") {
          // Check if a teacher had already added this student by email
          const studentsCol = collection(db, "students");
          const q = query(studentsCol, where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);
          
          let existingProfileData: any = null;
          let tempDocId: string | null = null;
          
          querySnapshot.forEach((docSnap) => {
            existingProfileData = docSnap.data();
            tempDocId = docSnap.id;
          });

          const initialProfile = {
            name: userName,
            email: userEmail,
            style: existingProfileData?.style || "Visual",
            speed: existingProfileData?.speed || "Moderate",
            strengths: existingProfileData?.strengths || ["Visual Graphs"],
            weaknesses: existingProfileData?.weaknesses || ["Syntax Rules"],
            xp: existingProfileData?.xp || 0,
            level: existingProfileData?.level || 1,
            streak: existingProfileData?.streak || 1,
            badges: existingProfileData?.badges || [ALL_BADGES[0]],
            completedNodes: existingProfileData?.completedNodes || [],
            bookmarkedNodes: existingProfileData?.bookmarkedNodes || [],
            nodeScores: existingProfileData?.nodeScores || {},
            lastActive: new Date().toISOString(),
            // Teacher-linked parameters
            teacherId: existingProfileData?.teacherId || null,
            predictedScore: existingProfileData?.predictedScore || 75,
            criticalIssue: existingProfileData?.criticalIssue || "New student registered via Google. Welcome!",
            remedyAction: existingProfileData?.remedyAction || "No current remedies active.",
            remedyStatus: existingProfileData?.remedyStatus || "pending"
          };

          await setDoc(doc(db, "students", uid), initialProfile);

          if (tempDocId) {
            await deleteDoc(doc(db, "students", tempDocId));
          }
        } else {
          // Create teacher profile
          await setDoc(doc(db, "teachers", uid), {
            name: userName,
            email: userEmail,
            classroomVibe: "Focused & Adaptive",
            targetBaseline: 75,
            retrievalInterval: 24,
            automatedIntervention: true,
            createdAt: new Date().toISOString()
          });
        }

        if (onAuthSuccess) {
          onAuthSuccess(uid, role);
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorStr = String(err.message || err);
      let friendlyMessage = err.message || "A Google sign-in error occurred.";
      
      if (err.code === "auth/popup-blocked" || errorStr.includes("popup-blocked")) {
        friendlyMessage = "The Google sign-in popup was blocked. Please enable popups or click 'Open in New Tab' at the top-right of your screen to log in!";
      } else if (err.code === "auth/cancelled-popup-request" || errorStr.includes("cancelled-popup-request")) {
        friendlyMessage = "Google Sign-In was cancelled.";
      } else if (err.code === "auth/popup-closed-by-user" || errorStr.includes("popup-closed-by-user")) {
        friendlyMessage = "Google Sign-In was closed or blocked. (Tip: Since you are inside the AI Studio preview iframe, browsers block cross-origin authentication. Please register/login using the Email and Password fields above, or click 'Open in New Tab' in the top-right corner to authenticate via Google!)";
      } else if (errorStr.includes("Failed to fetch") || errorStr.includes("failed to fetch")) {
        friendlyMessage = "Network fetch failed during Google Sign-In. (Tip: Since you are inside the AI Studio preview iframe, browsers block cross-origin auth requests. Please register/login using the Email and Password fields above, or click 'Open in New Tab' in the top-right corner to authenticate via Google!)";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);

    if (authMode === "forgot") {
      if (!email) {
        setError("Please enter your email address.");
        return;
      }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setResetSuccess(`A password reset link has been sent to ${email}. Please check your inbox (including your spam folder)!`);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to send password reset email. Check if the email address is correct.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (authMode === "signup" && !name) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      if (authMode === "login") {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        // Fetch role from Firestore user doc
        const userDocRef = doc(db, "users", uid);
        const { getDoc } = await import("../lib/firebase");
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (onAuthSuccess) {
            onAuthSuccess(uid, userData.role as "student" | "teacher");
          }
        } else {
          // Fallback if user doc doesn't exist but auth does
          setError("User account details not found. Please register again.");
        }
      } else {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 1. Save user role record
        await setDoc(doc(db, "users", uid), {
          uid,
          email,
          name,
          role,
          createdAt: new Date().toISOString()
        });

        if (role === "student") {
          // Check if a teacher had already added this student by email
          const studentsCol = collection(db, "students");
          const q = query(studentsCol, where("email", "==", email));
          const querySnapshot = await getDocs(q);
          
          let existingProfileData: any = null;
          let tempDocId: string | null = null;
          
          querySnapshot.forEach((docSnap) => {
            existingProfileData = docSnap.data();
            tempDocId = docSnap.id;
          });

          // Define initial default profile or copy existing profile from teacher creation
          const initialProfile = {
            name: name,
            email: email,
            style: existingProfileData?.style || "Visual",
            speed: existingProfileData?.speed || "Moderate",
            strengths: existingProfileData?.strengths || ["Visual Graphs"],
            weaknesses: existingProfileData?.weaknesses || ["Syntax Rules"],
            xp: existingProfileData?.xp || 0,
            level: existingProfileData?.level || 1,
            streak: existingProfileData?.streak || 1,
            badges: existingProfileData?.badges || [ALL_BADGES[0]],
            completedNodes: existingProfileData?.completedNodes || [],
            bookmarkedNodes: existingProfileData?.bookmarkedNodes || [],
            nodeScores: existingProfileData?.nodeScores || {},
            lastActive: new Date().toISOString(),
            // Teacher-linked parameters
            teacherId: inviteCode ? inviteCode.trim() : (existingProfileData?.teacherId || null),
            gradeLevel: gradeLevel,
            predictedScore: existingProfileData?.predictedScore || 75,
            criticalIssue: existingProfileData?.criticalIssue || "New student registered. Welcome!",
            remedyAction: existingProfileData?.remedyAction || "No current remedies active.",
            remedyStatus: existingProfileData?.remedyStatus || "pending"
          };

          // Save profile under student uid
          await setDoc(doc(db, "students", uid), initialProfile);

          // If there was a temporary student document created by the teacher, delete it to keep db clean
          if (tempDocId) {
            await deleteDoc(doc(db, "students", tempDocId));
          }
        } else {
          // Create teacher profile
          await setDoc(doc(db, "teachers", uid), {
            name,
            email,
            schoolName: schoolName.trim(),
            department: department.trim(),
            classroomVibe: "Focused & Adaptive",
            targetBaseline: 75,
            retrievalInterval: 24,
            automatedIntervention: true,
            createdAt: new Date().toISOString()
          });
        }

        if (onAuthSuccess) {
          onAuthSuccess(uid, role);
        }
      }
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = err.message || "An authentication error occurred.";
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already in use by another account.";
      } else if (err.code === "auth/invalid-credential") {
        friendlyMessage = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password is too weak. Please use at least 6 characters.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const isStudent = role === "student";
  const themeColor = isStudent ? "cyan" : "amber";
  const glowClass = isStudent ? "bg-cyan-500/10" : "bg-amber-500/10";
  const activeBtnClass = isStudent 
    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25 border-cyan-400" 
    : "bg-amber-500 text-black shadow-md shadow-amber-500/25 border-amber-400";
  const accentTextClass = isStudent ? "text-cyan-400" : "text-amber-400";
  const cardBorderClass = isStudent ? "border-cyan-500/20" : "border-amber-500/20";
  const inputRingClass = isStudent ? "focus:ring-cyan-500/30" : "focus:ring-amber-500/30";
  const submitBtnClass = isStudent 
    ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/15" 
    : "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/15";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#05070c] relative overflow-hidden">
      {/* Immersive background glows */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${glowClass} rounded-full blur-[120px] pointer-events-none transition-all duration-700`}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-5000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className={`w-14 h-14 rounded-2xl ${isStudent ? "bg-cyan-500" : "bg-amber-500"} flex items-center justify-center shadow-lg transition-all duration-500`}>
            <Brain className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
              MentorMind <span className={accentTextClass}>AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-1">
              Cognitive Learning Psychologist
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className={`glass border ${cardBorderClass} rounded-3xl p-8 shadow-2xl relative transition-all duration-500`}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              {authMode === "login" 
                ? `${role} logIn` 
                : authMode === "forgot"
                  ? `${role} reset`
                  : `join as ${role}`
              }
            </h2>
            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setError(null);
                setResetSuccess(null);
              }}
              className={`text-xs font-bold ${accentTextClass} hover:opacity-80 transition-all cursor-pointer`}
            >
              {authMode === "login" ? "Create Account" : "Sign In Portal"}
            </button>
          </div>

          {/* Unified Role Switcher */}
          <div className="space-y-1.5 mb-5">
            <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider">
              Select Your Access Portal
            </label>
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  role === "student"
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student Space</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  role === "teacher"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Teacher Portal</span>
              </button>
            </div>
          </div>

          {/* Custom Role Description Box to emphasize difference */}
          <div className={`mb-5 p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 leading-relaxed`}>
            {authMode === "forgot" ? (
              <span>🔑 <strong>Password Recovery:</strong> Enter your registered {role} email address. A secure recovery link will be triggered to securely reset your credentials in Firestore Auth.</span>
            ) : isStudent ? (
              <span>📚 <strong>Student Access:</strong> Unlock interactive cognitive retention graphs, your 15-minute active study queue, smart quizzes, and personalized learning DNA diagnostics.</span>
            ) : (
              <span>🏫 <strong>Educator Suite:</strong> Oversee student mastery profiles, configure target thresholds, design custom curriculum topics, and deploy automated recovery alerts.</span>
            )}
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-bounce">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{resetSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Sign Up Only) */}
            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 ${inputRingClass} placeholder-slate-500 transition-all focus:bg-white/10`}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@academy.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 ${inputRingClass} placeholder-slate-500 transition-all focus:bg-white/10`}
              />
            </div>

            {/* Password Field */}
            {authMode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Password
                  </label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot");
                        setError(null);
                        setResetSuccess(null);
                      }}
                      className={`text-[10px] font-mono font-bold uppercase ${accentTextClass} hover:opacity-85 transition-all cursor-pointer`}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:ring-2 ${inputRingClass} placeholder-slate-500 transition-all focus:bg-white/10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-all"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* CONDITIONAL SIGNUP FIELDS FOR STUDENT */}
            {authMode === "signup" && isStudent && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Advisor Invite Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter teacher's UID code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 ${inputRingClass} placeholder-slate-600 transition-all focus:bg-white/10`}
                  />
                  <p className="text-[9px] text-slate-500 font-mono">Connects you immediately with your educator's workspace dashboard.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Education Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className={`w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 ${inputRingClass}`}
                  >
                    <option value="High School">High School / Academy</option>
                    <option value="Undergraduate">Undergraduate / College</option>
                    <option value="Graduate">Postgraduate / Ph.D.</option>
                    <option value="Self-Taught">Independent Explorer</option>
                  </select>
                </div>
              </>
            )}

            {/* CONDITIONAL SIGNUP FIELDS FOR TEACHER */}
            {authMode === "signup" && !isStudent && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Institution / School Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanford University"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 ${inputRingClass} placeholder-slate-500 transition-all focus:bg-white/10`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Academic Department
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 ${inputRingClass} placeholder-slate-500 transition-all focus:bg-white/10`}
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl ${submitBtnClass} text-xs font-extrabold active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-6 cursor-pointer`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {authMode === "login" 
                      ? `Access ${isStudent ? "Student Space" : "Teacher Panel"}` 
                      : authMode === "forgot"
                        ? `Send Reset Password Link`
                        : `Register ${isStudent ? "Student Profile" : "Teacher Account"}`
                    }
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Social login separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="glass border border-white/5 px-3 py-0.5 rounded-full text-slate-500 font-mono text-[9px]">
                Or Authenticate Via Google
              </span>
            </div>
          </div>

          {/* Google Access Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <span className={`${accentTextClass} font-black text-sm tracking-wider`}>G</span>
            <span>Authenticate as {isStudent ? "Student" : "Teacher"}</span>
          </button>

          {/* Quick Info text */}
          <p className="text-[10px] text-center text-slate-500 mt-5 font-mono">
            {authMode === "login" 
              ? "Your learning DNA profiles are secure. Welcome back." 
              : "Registering binds your performance metrics with secure Firestore triggers."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
