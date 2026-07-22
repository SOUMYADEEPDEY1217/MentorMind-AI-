import React from "react";
import { StudentProfile, KnowledgeNode, Badge } from "../types";
import { Brain, Zap, Trophy, Flame, Eye, Volume2, BookOpen, Activity, AlertCircle, Calendar, Plus } from "lucide-react";

interface StudentProfileViewProps {
  profile: StudentProfile;
  selectedNode: KnowledgeNode | null;
  onUpdateStyle: (style: StudentProfile["style"]) => void;
  onUpdateSpeed: (speed: StudentProfile["speed"]) => void;
  onAddStrength: (strength: string) => void;
  onAddWeakness: (weakness: string) => void;
  allBadges: Badge[];
}

export default function StudentProfileView({
  profile,
  selectedNode,
  onUpdateStyle,
  onUpdateSpeed,
  onAddStrength,
  onAddWeakness,
  allBadges
}: StudentProfileViewProps) {
  const [newStrength, setNewStrength] = React.useState("");
  const [newWeakness, setNewWeakness] = React.useState("");

  // Calculate exponential forgetting curve data points: R = e^(-t/S)
  const renderForgettingCurvePoints = () => {
    if (!selectedNode) return null;
    const strength = Math.max(1, selectedNode.daysUntilForget);
    const points: Array<{ t: number; r: number }> = [];

    // Plot over 10 days
    for (let t = 0; t <= 10; t++) {
      const r = Math.exp(-t / strength) * 100;
      points.push({ t, r });
    }

    // Convert to SVG path
    const width = 280;
    const height = 110;
    const padding = 15;

    const scaleX = (t: number) => padding + (t / 10) * (width - padding * 2);
    const scaleY = (r: number) => height - padding - (r / 100) * (height - padding * 2);

    let pathD = "";
    points.forEach((p, idx) => {
      const x = scaleX(p.t);
      const y = scaleY(p.r);
      if (idx === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    return { points, pathD, scaleX, scaleY, width, height, padding };
  };

  const curveData = renderForgettingCurvePoints();

  const getStyleIcon = (style: StudentProfile["style"]) => {
    switch (style) {
      case "Visual":
        return <Eye className="w-4 h-4 text-emerald-400" />;
      case "Auditory":
        return <Volume2 className="w-4 h-4 text-cyan-400" />;
      case "Read/Write":
        return <BookOpen className="w-4 h-4 text-violet-400" />;
      case "Kinesthetic":
        return <Activity className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div id="student-dna-panel" className="glass border border-white/10 rounded-3xl p-6 text-slate-100 flex flex-col gap-6 h-full shadow-xl">
      {/* Profile Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">{profile.name}</h2>
            <span className="bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              Lv. {profile.level}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Mental Health & Education Profile</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
            <span>{profile.streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs font-mono font-bold">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span>{profile.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Interactive DNA Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          🧠 AI Learning DNA Config
        </h3>

        {/* Learning Style Picker */}
        <div className="grid grid-cols-2 gap-2">
          {(["Visual", "Auditory", "Read/Write", "Kinesthetic"] as StudentProfile["style"][]).map((style) => (
            <button
              key={style}
              id={`style-btn-${style}`}
              onClick={() => onUpdateStyle(style)}
              className="flex items-center gap-2 p-2 rounded-xl text-left border text-xs transition-all duration-200 cursor-pointer bg-white/5 border-white/10 hover:border-cyan-500/30 text-slate-300 active:scale-[0.98] data-[selected=true]:bg-cyan-500 data-[selected=true]:border-cyan-400 data-[selected=true]:text-black data-[selected=true]:font-bold"
              data-selected={profile.style === style}
            >
              {getStyleIcon(style)}
              <span>{style}</span>
            </button>
          ))}
        </div>

        {/* Speed Option */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absorption Pace:</span>
          <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
            {(["Slow & Steady", "Moderate", "Fast-Paced"] as StudentProfile["speed"][]).map((speed) => (
              <button
                key={speed}
                id={`speed-btn-${speed}`}
                onClick={() => onUpdateSpeed(speed)}
                className={`py-1 rounded-lg text-[10px] font-medium transition-all duration-150 cursor-pointer ${
                  profile.speed === speed
                    ? "bg-white/10 text-cyan-400 font-bold shadow-sm"
                    : "bg-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic List for Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Cognitive Strengths:</span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {profile.strengths.map((str, i) => (
                <span key={i} className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {str}
                </span>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newStrength.trim()) {
                  onAddStrength(newStrength.trim());
                  setNewStrength("");
                }
              }}
              className="flex gap-1"
            >
              <input
                type="text"
                placeholder="Add skill..."
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg text-[10px] px-2 py-1 focus:outline-none focus:border-cyan-500 text-slate-200 w-full"
              />
              <button type="submit" className="bg-white/5 hover:bg-white/10 border border-white/10 p-1 rounded-lg text-slate-400 hover:text-slate-200">
                <Plus className="w-3 h-3" />
              </button>
            </form>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Identified Weaknesses:</span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {profile.weaknesses.map((weak, i) => (
                <span key={i} className="bg-rose-500/10 text-rose-400 text-[10px] px-2 py-0.5 rounded-md border border-rose-500/20">
                  {weak}
                </span>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newWeakness.trim()) {
                  onAddWeakness(newWeakness.trim());
                  setNewWeakness("");
                }
              }}
              className="flex gap-1"
            >
              <input
                type="text"
                placeholder="Add block..."
                value={newWeakness}
                onChange={(e) => setNewWeakness(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg text-[10px] px-2 py-1 focus:outline-none focus:border-cyan-500 text-slate-200 w-full"
              />
              <button type="submit" className="bg-white/5 hover:bg-white/10 border border-white/10 p-1 rounded-lg text-slate-400 hover:text-slate-200">
                <Plus className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Forgetting Curve Prediction Widget */}
      <div className="border-t border-white/10 pt-4 space-y-3">
        <h3 className="text-xs font-bold tracking-[0.2em] text-slate-300 uppercase flex items-center gap-2 font-mono">
          <Activity className="w-4 h-4 text-fuchsia-400" />
          Predictive Analytics
        </h3>

        {selectedNode ? (
          <div className="glass rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold text-white">{selectedNode.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Predicted memory strength</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  selectedNode.retention >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                  selectedNode.retention >= 50 ? "bg-amber-500/10 text-amber-400" :
                  "bg-rose-500/10 text-rose-400 animate-pulse"
                }`}>
                  {selectedNode.retention}% Strength
                </span>
              </div>
            </div>

            {/* SVG Decay Plot */}
            {curveData && (
              <div className="relative">
                <svg width="100%" height={curveData.height} viewBox={`0 0 ${curveData.width} ${curveData.height}`} className="mx-auto overflow-visible">
                  {/* Grid Lines */}
                  <line x1={curveData.padding} y1={curveData.scaleY(50)} x2={curveData.width - curveData.padding} y2={curveData.scaleY(50)} stroke="#ef4444" strokeDasharray="3,3" strokeWidth="0.8" opacity="0.4" />
                  <text x={curveData.width - curveData.padding + 2} y={curveData.scaleY(52)} fill="#ef4444" fontSize="6" opacity="0.6" fontWeight="bold">Forget limit (50%)</text>

                  {/* Curve Path */}
                  <path d={curveData.pathD} fill="none" stroke="url(#gradient-forget)" strokeWidth="2.5" />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient-forget" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>

                  {/* Interactive point indicator */}
                  <circle cx={curveData.scaleX(selectedNode.daysUntilForget)} cy={curveData.scaleY(50)} r="4.5" fill="#f59e0b" className="animate-ping" />
                  <circle cx={curveData.scaleX(selectedNode.daysUntilForget)} cy={curveData.scaleY(50)} r="3" fill="#ef4444" />
                </svg>

                <div className="flex justify-between text-[8px] text-slate-400 font-mono px-2 -mt-1">
                  <span>Day 0 (Studied)</span>
                  <span className="text-amber-400">Recall Threshold</span>
                  <span>Day 10 (Critical)</span>
                </div>
              </div>
            )}

            {/* AI Scheduling Tip */}
            <div className="flex gap-2 bg-black/40 p-2.5 rounded-xl border border-white/10 text-[10px] text-slate-300 leading-relaxed">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Proactive Scheduler:</span> Re-study required in{" "}
                <span className="text-amber-400 font-bold font-mono">{selectedNode.daysUntilForget} days</span> before retention dips below optimal recall.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/60 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6 text-slate-600" />
            Select a knowledge node on the 3D map to predict its cognitive forgetting curve.
          </div>
        )}
      </div>

      {/* Gamification Achievements Section */}
      <div className="border-t border-white/10 pt-4 mt-auto space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em] font-mono">Badges Unlocked</span>
          <span className="text-[10px] text-slate-500 font-bold font-mono">{profile.badges.length} / {allBadges.length}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {allBadges.map((badge) => {
            const isUnlocked = profile.badges.some((b) => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`relative group flex flex-col items-center p-2 rounded-xl border transition-all duration-300 ${
                  isUnlocked
                    ? "bg-white/5 border-cyan-500/40 text-yellow-400 scale-100 shadow-sm"
                    : "bg-white/5 border-white/5 text-slate-600 scale-95 opacity-55"
                }`}
              >
                <div className="p-1 rounded-lg bg-black/40 border border-white/10">
                  <Trophy className={`w-4 h-4 ${isUnlocked ? "text-yellow-400" : "text-slate-600"}`} />
                </div>
                {/* Micro tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 w-36 pointer-events-none">
                  <div className="bg-slate-950 border border-slate-800 text-[9px] text-slate-100 p-2 rounded-lg shadow-xl text-center">
                    <p className="font-bold text-white">{badge.name}</p>
                    <p className="text-slate-400 mt-0.5">{badge.description}</p>
                    {isUnlocked && <p className="text-indigo-400 font-mono text-[8px] mt-1">Unlocked ✓</p>}
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-950 border-b border-r border-slate-800 transform rotate-45 -mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
