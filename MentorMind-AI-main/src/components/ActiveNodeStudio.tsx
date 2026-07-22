import React, { useState, useEffect, useRef } from "react";
import { KnowledgeNode, StudentProfile, QuizQuestion } from "../types";
import { Sparkles, MessageSquare, BookOpen, Layers, CheckCircle, ArrowRight, Loader2, Bookmark, Check, ShieldAlert } from "lucide-react";

interface ActiveNodeStudioProps {
  node: KnowledgeNode;
  profile: StudentProfile;
  onBookmarkToggle: (nodeId: string) => void;
  isBookmarked: boolean;
  onQuizCompleted: (earnedXp: number, completedNodeId: string) => void;
  selectedDifficulty: KnowledgeNode["difficulty"];
  onChangeDifficulty: (diff: KnowledgeNode["difficulty"]) => void;
  activeTab?: "explain" | "chat" | "quiz";
  onTabChange?: (tab: "explain" | "chat" | "quiz") => void;
  prefilledPrompt?: string;
  onClearPrefilledPrompt?: () => void;
}

// Simple custom component to render beautiful markdown snippets safely
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  return (
    <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Header 3
        if (trimmed.startsWith("###")) {
          return (
            <h4 key={idx} className="text-sm font-bold text-white pt-2 flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {trimmed.replace("###", "").trim()}
            </h4>
          );
        }
        // Header 4
        if (trimmed.startsWith("####")) {
          return (
            <h5 key={idx} className="text-xs font-bold text-indigo-400 uppercase tracking-wider pt-1.5">
              {trimmed.replace("####", "").trim()}
            </h5>
          );
        }
        // Bold headers
        if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
          return (
            <div key={idx} className="font-bold text-slate-200 mt-1">
              {trimmed.replace(/\*\*/g, "")}
            </div>
          );
        }
        // Code Block
        if (trimmed.startsWith("```")) {
          if (trimmed === "```" || trimmed.length > 3) {
            return null; // Skip code fences
          }
        }
        if (line.startsWith("    ") || line.startsWith("\t") || (trimmed.includes("──►") || trimmed.includes("[Input"))) {
          return (
            <pre key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-indigo-300 overflow-x-auto whitespace-pre my-1 shadow-inner">
              {line}
            </pre>
          );
        }
        // Bullet list
        if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="w-1 h-1 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <span>
                {trimmed.substring(1).trim().replace(/\*\*(.*?)\*\*/g, "$1")}
              </span>
            </div>
          );
        }

        // Standard Paragraph with inline bolding helper
        if (trimmed.length === 0) return <div key={idx} className="h-1" />;

        // Basic inline bold parsing
        const parts = trimmed.split(/\*\*/g);
        return (
          <p key={idx} className="text-slate-300">
            {parts.map((part, partIdx) => 
              partIdx % 2 === 1 ? <strong key={partIdx} className="text-white font-semibold">{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function ActiveNodeStudio({
  node,
  profile,
  onBookmarkToggle,
  isBookmarked,
  onQuizCompleted,
  selectedDifficulty,
  onChangeDifficulty,
  activeTab: propsActiveTab,
  onTabChange,
  prefilledPrompt,
  onClearPrefilledPrompt
}: ActiveNodeStudioProps) {
  const [localActiveTab, setLocalActiveTab] = useState<"explain" | "chat" | "quiz">("explain");
  const activeTab = propsActiveTab !== undefined ? propsActiveTab : localActiveTab;
  const setActiveTab = onTabChange !== undefined ? onTabChange : setLocalActiveTab;

  const [explanation, setExplanation] = useState<string>("");
  const [loadingExplain, setLoadingExplain] = useState<boolean>(false);

  // Chat Mentor States
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "model"; text: string }>>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quiz States
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  // Trigger programmatic chat send when prefilledPrompt is passed
  useEffect(() => {
    if (prefilledPrompt && !loadingChat) {
      const triggerMessage = async () => {
        const userText = prefilledPrompt;
        if (onClearPrefilledPrompt) {
          onClearPrefilledPrompt();
        }
        setChatHistory((prev) => [...prev, { role: "user", text: userText }]);
        setLoadingChat(true);

        try {
          const response = await fetch("/api/chat-mentor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userText,
              chatHistory: [...chatHistory, { role: "user", text: userText }],
              profile: {
                style: profile.style,
                speed: profile.speed,
                strengths: profile.strengths,
                weaknesses: profile.weaknesses
              }
            })
          });
          const data = await response.json();
          setChatHistory((prev) => [...prev, { role: "model", text: data.text }]);
        } catch (err) {
          console.error(err);
          setChatHistory((prev) => [...prev, { role: "model", text: "I experienced a minor latency block in my cognitive engine. Let's try that again!" }]);
        } finally {
          setLoadingChat(false);
        }
      };
      
      setActiveTab("chat");
      triggerMessage();
    }
  }, [prefilledPrompt]);

  // Reset states when current active node or difficulty changes
  useEffect(() => {
    setExplanation("");
    setChatHistory([
      {
        role: "model",
        text: `Welcome! I am your MentorMind AI psychologist. I notice you've selected **${node.name}** at the **${selectedDifficulty}** tier.\n\nSince your profile lists you as a **${profile.style}** learner who studies at **${profile.speed}** speed, let's explore this step-by-step. Feel free to ask me to simplify, draw a diagram, or provide real-life metaphors!`
      }
    ]);
    setActiveTab("explain");
    setQuizQuestions([]);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizComplete(false);
  }, [node.id, selectedDifficulty]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loadingChat]);

  // Fetch explanation from Gemini API
  const handleFetchExplanation = async () => {
    setLoadingExplain(true);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicName: node.name,
          profile: {
            style: profile.style,
            speed: profile.speed,
            strengths: profile.strengths,
            weaknesses: profile.weaknesses
          },
          difficulty: selectedDifficulty
        })
      });
      const data = await response.json();
      setExplanation(data.explanation);
    } catch (err) {
      console.error(err);
      setExplanation("Sorry, I had trouble connecting to the psychological adaptive model. Please try again.");
    } finally {
      setLoadingExplain(false);
    }
  };

  // Trigger initial explanation once tab opened if empty
  useEffect(() => {
    if (activeTab === "explain" && !explanation && !loadingExplain) {
      handleFetchExplanation();
    }
  }, [activeTab, node.id, selectedDifficulty]);

  // Send message to AI mentor chat
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || loadingChat) return;

    const userText = chatMessage.trim();
    setChatMessage("");
    setChatHistory((prev) => [...prev, { role: "user", text: userText }]);
    setLoadingChat(true);

    try {
      const response = await fetch("/api/chat-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          chatHistory: chatHistory,
          profile: {
            style: profile.style,
            speed: profile.speed,
            strengths: profile.strengths,
            weaknesses: profile.weaknesses
          }
        })
      });
      const data = await response.json();
      setChatHistory((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: "model", text: "I experienced a minor latency block in my cognitive engine. Let's try that again!" }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Fetch custom quiz from Gemini API
  const handleFetchQuiz = async () => {
    setLoadingQuiz(true);
    setQuizComplete(false);
    setQuizScore(0);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicName: node.name,
          profile: {
            style: profile.style
          },
          difficulty: selectedDifficulty
        })
      });
      const data = await response.json();
      setQuizQuestions(data.quiz || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  useEffect(() => {
    if (activeTab === "quiz" && quizQuestions.length === 0 && !loadingQuiz) {
      handleFetchQuiz();
    }
  }, [activeTab, node.id, selectedDifficulty]);

  const handleSelectAnswer = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || quizSubmitted) return;

    const correct = selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer;
    if (correct) {
      setQuizScore((prev) => prev + 1);
    }
    setQuizSubmitted(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setQuizSubmitted(false);

    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      setQuizComplete(true);
      // Give XP based on score
      const totalPossible = quizQuestions.length;
      const finalScorePercentage = (quizScore / totalPossible) * 100;
      const earnedXp = Math.round(finalScorePercentage * 0.5 + 10); // e.g. up to 60 XP
      onQuizCompleted(earnedXp, node.id);
    }
  };

  return (
    <div id="active-concept-studio" className="bg-transparent p-6 text-slate-100 flex flex-col gap-5 h-full">
      {/* Node Header Info */}
      <div className="flex justify-between items-start border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {node.subject}
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Depth: {node.depth}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">{node.name}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{node.description}</p>
        </div>

        <div className="flex gap-2">
          <button
            id="bookmark-toggle-btn"
            onClick={() => onBookmarkToggle(node.id)}
            className={`p-2 rounded-xl border transition-all duration-200 ${
              isBookmarked
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-sm"
                : "bg-white/5 border-white/10 hover:border-cyan-500/30 text-slate-400"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-yellow-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Adaptive Difficulty Tier Selector */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between bg-black/40 p-3 rounded-2xl border border-white/10">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">Target Cognitive Tier:</span>
        <div className="flex flex-wrap gap-1 bg-white/5 p-0.5 rounded-xl border border-white/10">
          {(["Easy", "Medium", "Hard", "Interview-level"] as KnowledgeNode["difficulty"][]).map((diff) => (
            <button
              key={diff}
              id={`difficulty-btn-${diff}`}
              onClick={() => onChangeDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-150 cursor-pointer ${
                selectedDifficulty === diff
                  ? "bg-cyan-500 text-black font-bold shadow-md"
                  : "bg-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1 border-b border-white/10 pb-2">
        <button
          id="tab-explain"
          onClick={() => setActiveTab("explain")}
          className={`pb-2 text-xs font-semibold tracking-wide border-b-2 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            activeTab === "explain"
              ? "border-cyan-400 text-cyan-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="text-center truncate">
            <span className="hidden sm:inline">Adaptive </span>Explanation
          </span>
        </button>

        <button
          id="tab-chat"
          onClick={() => setActiveTab("chat")}
          className={`pb-2 text-xs font-semibold tracking-wide border-b-2 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            activeTab === "chat"
              ? "border-cyan-400 text-cyan-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          <span className="text-center truncate">
            <span className="hidden sm:inline">AI </span>Psychologist
          </span>
        </button>

        <button
          id="tab-quiz"
          onClick={() => setActiveTab("quiz")}
          className={`pb-2 text-xs font-semibold tracking-wide border-b-2 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            activeTab === "quiz"
              ? "border-cyan-400 text-cyan-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="text-center truncate">
            <span className="hidden sm:inline">Boss </span>Quiz<span className="hidden md:inline"> Station</span>
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto max-h-[340px] pr-1.5 scrollbar-thin">
        {/* TAB 1: EXPLAIN */}
        {activeTab === "explain" && (
          <div className="space-y-4">
            {loadingExplain ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs text-slate-400 font-mono tracking-wider animate-pulse uppercase">
                  COMPUTING NEURAL ABSORPTION EXPLANATION...
                </p>
              </div>
            ) : (
              <div className="bg-black/40 p-4 rounded-2xl border border-white/10 relative shadow-inner">
                <div className="absolute top-3 right-3 flex gap-1.5 items-center bg-cyan-500/10 border border-cyan-500/20 rounded-md px-2 py-0.5 text-[9px] font-mono font-semibold text-cyan-400">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Gemini Psychologist Engine
                </div>
                <SimpleMarkdown text={explanation} />

                {/* Regenerate Trigger */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    id="re-explain-btn"
                    onClick={handleFetchExplanation}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Regenerate with revised psychology DNA
                  </button>
                </div>
              </div>
            )}

            {/* Default concept materials */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trusted Reference Notes:</h4>
              <div className="grid grid-cols-1 gap-2">
                {node.materials.map((mat) => (
                  <div key={mat.id} className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <h5 className="text-xs font-bold text-white">{mat.title}</h5>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{mat.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI PSYCHOLOGIST CHAT */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-[320px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {/* History logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      chat.role === "user"
                        ? "bg-cyan-500 text-black font-semibold rounded-br-none"
                        : "bg-black/40 text-slate-300 border border-white/10 rounded-bl-none"
                    }`}
                  >
                    <div className={`font-bold text-[9px] uppercase tracking-widest mb-1 ${
                      chat.role === "user" ? "text-cyan-950" : "text-cyan-400"
                    }`}>
                      {chat.role === "user" ? "Student" : "MentorMind Psychologist"}
                    </div>
                    <p className="whitespace-pre-line">{chat.text}</p>
                  </div>
                </div>
              ))}
              {loadingChat && (
                <div className="flex justify-start">
                  <div className="bg-black/40 border border-white/10 text-slate-300 rounded-2xl rounded-bl-none p-3 max-w-[80%] flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span className="text-[10px] font-mono tracking-widest text-slate-400">ANALYZING CONCEPT COGNITION...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendChatMessage} className="p-2 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                type="text"
                placeholder="Ask about details, memory triggers, or homework help..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={loadingChat}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                id="send-chat-btn"
                type="submit"
                disabled={!chatMessage.trim() || loadingChat}
                className="bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl px-4 py-1.5 text-xs font-bold transition-all shrink-0 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                Ask AI
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: BOSS QUIZ STATION */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            {loadingQuiz ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-fuchsia-400 animate-spin" />
                <p className="text-xs text-slate-400 font-mono tracking-wider animate-pulse">
                  GENERATING SYSTEMATIC ADAPTIVE BLOOM'S QUIZ...
                </p>
              </div>
            ) : quizComplete ? (
              <div className="glass p-6 rounded-2xl border border-emerald-500/30 text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Quiz Completed Successfully!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    You answered <span className="text-white font-bold">{quizScore} / {quizQuestions.length}</span> questions correctly.
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl inline-block text-xs font-bold font-mono">
                  + {Math.round((quizScore / quizQuestions.length) * 100 * 0.5 + 10)} XP Earned!
                </div>
                <div>
                  <button
                    id="quiz-retry-btn"
                    onClick={handleFetchQuiz}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                  >
                    Take another adaptive quiz
                  </button>
                </div>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="glass p-4 rounded-2xl border border-white/10 space-y-4 shadow-inner">
                {/* Score and level indicators */}
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-white/10 pb-2">
                  <span>Bloom's Taxonomy: <strong className="text-fuchsia-400">{quizQuestions[currentQuizIndex].taxonomyLevel}</strong></span>
                  <span>Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                </div>

                <p className="text-xs font-bold text-white leading-relaxed">
                  {quizQuestions[currentQuizIndex].question}
                </p>

                {/* Options List */}
                <div className="space-y-2">
                  {quizQuestions[currentQuizIndex].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswer === oIdx;
                    const isCorrect = oIdx === quizQuestions[currentQuizIndex].correctAnswer;
                    return (
                      <button
                        key={oIdx}
                        id={`quiz-option-${oIdx}`}
                        onClick={() => handleSelectAnswer(oIdx)}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition-all duration-150 flex items-center gap-2.5 ${
                          quizSubmitted
                            ? isCorrect
                              ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-medium"
                              : isSelected
                              ? "bg-rose-500/15 border-rose-500/50 text-rose-300"
                              : "bg-white/5 border-white/5 text-slate-500"
                            : isSelected
                            ? "bg-cyan-500 border-cyan-400 text-black font-bold"
                            : "bg-white/5 border-white/10 hover:border-cyan-500/30 text-slate-300"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-black/40 border border-white/10 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold text-slate-400">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Answer validation/explanation */}
                {quizSubmitted && (
                  <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 p-3 rounded-xl text-[11px] text-fuchsia-300 leading-relaxed mt-2">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-white font-mono uppercase tracking-wider text-[10px]">
                      <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                      Psychological insight:
                    </div>
                    {quizQuestions[currentQuizIndex].explanation}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end pt-2 border-t border-white/10">
                  {!quizSubmitted ? (
                    <button
                      id="submit-answer-btn"
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Confirm Selection
                    </button>
                  ) : (
                    <button
                      id="next-question-btn"
                      onClick={handleNextQuestion}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {currentQuizIndex + 1 < quizQuestions.length ? "Next Question" : "Complete Quiz"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
                <ShieldAlert className="w-8 h-8 text-slate-700" />
                <p>Unable to load custom adaptive questions at this stage.</p>
                <button
                  id="retry-fetch-quiz-btn"
                  onClick={handleFetchQuiz}
                  className="mt-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Reload Boss Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
