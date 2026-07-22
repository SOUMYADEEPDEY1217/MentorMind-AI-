import React, { useState, useEffect } from "react";
import { KnowledgeNode, StudentProfile } from "../types";
import { Zap, CheckCircle, Circle, ArrowRight, Sparkles, AlertCircle, Clock, CheckCircle2, Shield } from "lucide-react";

interface LifeSaverPlannerProps {
  nodes: KnowledgeNode[];
  selectedSubject: string;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onTriggerDraft: (node: KnowledgeNode, promptType: "outline" | "quiz" | "metaphor") => void;
  profile: StudentProfile;
  theme: "dark" | "light";
}

interface PlannerTask {
  id: string;
  title: string;
  timeBlock: string;
  duration: string;
  description: string;
  type: "recall" | "procrastination" | "challenge";
  nodeId: string;
  actionLabel: string;
}

export default function LifeSaverPlanner({
  nodes,
  selectedSubject,
  selectedNodeId,
  onSelectNode,
  onTriggerDraft,
  profile,
  theme
}: LifeSaverPlannerProps) {
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);

  // Generate actionable tasks dynamically based on active subject, selected node, and memory retention parameters
  useEffect(() => {
    const subjectNodes = selectedSubject === "All" 
      ? nodes 
      : nodes.filter(n => n.subject === selectedSubject);

    if (subjectNodes.length === 0) return;

    // 1. Critical recall candidate (lowest retention)
    const sortedByRetention = [...subjectNodes].sort((a, b) => a.retention - b.retention);
    const criticalNode = sortedByRetention[0];

    // 2. Procrastination buster candidate (currently selected node)
    const activeNode = nodes.find(n => n.id === selectedNodeId) || subjectNodes[0];

    // 3. Challenge candidate (low mastery node)
    const sortedByMastery = [...subjectNodes]
      .filter(n => n.id !== criticalNode.id && n.id !== activeNode.id)
      .sort((a, b) => a.mastery - b.mastery);
    const challengeNode = sortedByMastery[0] || criticalNode;

    const newTasks: PlannerTask[] = [];

    // Task 1: Recall Drill
    if (criticalNode) {
      newTasks.push({
        id: `recall-${criticalNode.id}`,
        title: `Stop Retention Decay: ${criticalNode.name}`,
        timeBlock: "Immediate Action (Next 15 min)",
        duration: "15 min",
        description: `Your memory retention for this concept has decayed to ${criticalNode.retention}%. Let's review it immediately before your recall threshold hits critical level.`,
        type: "recall",
        nodeId: criticalNode.id,
        actionLabel: "Analyze Explanation"
      });
    }

    // Task 2: Procrastination Buster
    if (activeNode) {
      newTasks.push({
        id: `procrastinate-${activeNode.id}`,
        title: `Draft Cheat-Sheet: ${activeNode.name}`,
        timeBlock: "Next Study Interval",
        duration: "20 min",
        description: `Stuck or feeling overwhelmed? Let's bypass procrastination by auto-generating a custom simplified learning outline tailored for a ${profile.style} student.`,
        type: "procrastination",
        nodeId: activeNode.id,
        actionLabel: "Draft Proactive Outline"
      });
    }

    // Task 3: Boss Quiz Challenge
    if (challengeNode) {
      newTasks.push({
        id: `challenge-${challengeNode.id}`,
        title: `Reinforce Mastery: ${challengeNode.name}`,
        timeBlock: "Comprehension Check Block",
        duration: "10 min",
        description: `Your current mastery of this concept stands at ${challengeNode.mastery}%. Challenge yourself with an adaptive quiz to cement these neural connections.`,
        type: "challenge",
        nodeId: challengeNode.id,
        actionLabel: "Launch Boss Quiz"
      });
    }

    setTasks(newTasks);
  }, [nodes, selectedSubject, selectedNodeId, profile.style]);

  const handleToggleTask = (taskId: string) => {
    setCompletedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  };

  // Stress-o-meter rating based on task completion
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTaskIds.filter(id => tasks.some(t => t.id === id)).length / tasks.length) * 100)
    : 0;

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
      theme === "dark" 
        ? "bg-slate-950/40 border-white/10 text-slate-100" 
        : "bg-white border-slate-200 text-slate-800 shadow-md"
    }`}>
      {/* Background ambient lighting */}
      {theme === "dark" && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 font-mono flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              Life-Saver Action Queue
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Proactive daily micro-tasks designed by your adaptive psychologist to bypass study friction.
          </p>
        </div>

        {/* Dynamic Stress Relief Meter */}
        <div className={`p-2.5 rounded-2xl border flex items-center gap-3 ${
          theme === "dark" ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-wider font-mono text-slate-400">Stress Reduction</span>
            <span className="text-xs font-bold font-mono text-cyan-400">{completionPercentage}% COMPLETE</span>
          </div>
          <div className="w-10 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const isDone = completedTaskIds.includes(task.id);
          return (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl border transition-all duration-200 relative group flex flex-col md:flex-row gap-3 md:items-center justify-between ${
                isDone
                  ? theme === "dark" 
                    ? "bg-emerald-500/5 border-emerald-500/20 text-slate-500 opacity-65"
                    : "bg-emerald-50/60 border-emerald-200 text-slate-500 opacity-75"
                  : selectedNodeId === task.nodeId
                  ? theme === "dark"
                    ? "bg-cyan-500/5 border-cyan-500/40 text-slate-100 shadow-sm"
                    : "bg-cyan-500/5 border-cyan-500/30 text-slate-900 shadow-sm"
                  : theme === "dark"
                  ? "bg-white/5 border-white/10 hover:border-white/20 text-slate-200"
                  : "bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-800"
              }`}
            >
              {/* Checkbox and Text Column */}
              <div className="flex items-start gap-3 flex-1">
                <button
                  id={`checkbox-${task.id}`}
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-0.5 shrink-0 transition-all duration-150 ${
                    isDone ? "text-emerald-500 hover:text-emerald-400" : "text-slate-400 hover:text-cyan-400"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-500/10 stroke-[2.5]" />
                  ) : (
                    <Circle className="w-5 h-5 stroke-[2]" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold leading-tight ${isDone ? "line-through text-slate-500" : ""}`}>
                      {task.title}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded flex items-center gap-1 border ${
                      task.type === "recall"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : task.type === "procrastination"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20"
                    }`}>
                      <Clock className="w-2.5 h-2.5" />
                      {task.duration}
                    </span>
                  </div>

                  <p className={`text-[11px] leading-relaxed max-w-2xl ${
                    isDone ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {task.description}
                  </p>

                  <div className="flex items-center gap-2.5 pt-0.5 text-[9px] font-mono text-slate-500">
                    <span className="uppercase tracking-wide text-cyan-400">{task.timeBlock}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex shrink-0 items-center gap-2 mt-2 md:mt-0 justify-end">
                <button
                  id={`action-${task.id}`}
                  disabled={isDone}
                  onClick={() => {
                    onSelectNode(task.nodeId);
                    if (task.type === "procrastination") {
                      onTriggerDraft(nodes.find(n => n.id === task.nodeId)!, "outline");
                    } else if (task.type === "challenge") {
                      onTriggerDraft(nodes.find(n => n.id === task.nodeId)!, "quiz");
                    } else {
                      onTriggerDraft(nodes.find(n => n.id === task.nodeId)!, "outline");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-150 flex items-center gap-1 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                    selectedNodeId === task.nodeId
                      ? "bg-cyan-500 text-black hover:bg-cyan-400"
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <span>{task.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
