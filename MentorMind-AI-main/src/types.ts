export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface StudentProfile {
  name: string;
  style: "Visual" | "Auditory" | "Read/Write" | "Kinesthetic";
  speed: "Slow & Steady" | "Moderate" | "Fast-Paced";
  strengths: string[];
  weaknesses: string[];
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
  completedNodes: string[]; // List of Node IDs
  bookmarkedNodes: string[]; // List of Node IDs
  nodeScores: Record<string, number>; // nodeID -> score / 100
  lastActive: string;
}

export interface NodeMaterial {
  id: string;
  title: string;
  type: "concept" | "video" | "notes" | "interactive";
  content: string;
}

export interface KnowledgeNode {
  id: string;
  name: string;
  subject: string;
  description: string;
  parentId?: string;
  depth: number; // For visualization layer levels
  mastery: number; // 0 to 100
  retention: number; // 0 to 100 (Forgetting Curve prediction)
  daysUntilForget: number; // Predicted days before forgetting
  difficulty: "Easy" | "Medium" | "Hard" | "Interview-level";
  materials: NodeMaterial[];
}

export interface KnowledgeLink {
  source: string; // source ID
  target: string; // target ID
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  taxonomyLevel: string;
}
