import { KnowledgeNode, KnowledgeLink, Badge } from "./types";

export const INITIAL_NODES: KnowledgeNode[] = [
  // Subject: Computer Science
  {
    id: "cs-root",
    name: "Computer Science",
    subject: "Computer Science",
    description: "The study of computers, algorithmic processes, and data structures.",
    depth: 0,
    mastery: 85,
    retention: 90,
    daysUntilForget: 12,
    difficulty: "Easy",
    materials: [
      { id: "m1", title: "Introduction to Computation", type: "concept", content: "Learn the foundational components of modern computer science: binary encoding, computation, and CPU cycle logic." }
    ]
  },
  {
    id: "cs-python",
    name: "Python Programming",
    subject: "Computer Science",
    description: "An elegant, high-level, dynamic language emphasizing readability.",
    parentId: "cs-root",
    depth: 1,
    mastery: 70,
    retention: 65,
    daysUntilForget: 4,
    difficulty: "Easy",
    materials: [
      { id: "m2", title: "Why Python is Clean", type: "concept", content: "Python relies on indentation-based syntax rather than braces, which allows the brain to map logic streams without syntactic visual noise." },
      { id: "m3", title: "Zen of Python Audio Analogies", type: "notes", content: "Analogy: Writing Python is like explaining a recipe in natural, step-by-step English sentences. Flat is better than nested!" }
    ]
  },
  {
    id: "cs-loops",
    name: "Control Flow & Loops",
    subject: "Computer Science",
    description: "Iterative logic patterns utilizing 'for' and 'while' blocks.",
    parentId: "cs-python",
    depth: 2,
    mastery: 95,
    retention: 92,
    daysUntilForget: 18,
    difficulty: "Easy",
    materials: [
      { id: "m4", title: "Infinite Iteration Risk", type: "concept", content: "A loop must always have a terminating condition. Else, it leads to memory exhaustion." }
    ]
  },
  {
    id: "cs-functions",
    name: "Functional Blocks",
    subject: "Computer Science",
    description: "Re-usable modules of code that execute isolated procedures.",
    parentId: "cs-python",
    depth: 2,
    mastery: 60,
    retention: 50,
    daysUntilForget: 2,
    difficulty: "Medium",
    materials: [
      { id: "m5", title: "Scope & Closure", type: "notes", content: "Inner functions hold onto lexical environments even after parent frames execute. This is powerful for encapsulation." }
    ]
  },
  {
    id: "cs-recursion",
    name: "Recursion Mechanics",
    subject: "Computer Science",
    description: "Solving problems by breaking them down into self-calling subproblems.",
    parentId: "cs-functions",
    depth: 3,
    mastery: 45,
    retention: 35,
    daysUntilForget: 1,
    difficulty: "Hard",
    materials: [
      { id: "m6", title: "Visualizing the Call Stack", type: "concept", content: "Every recursive call pushes a new frame onto the stack. If there is no base case, you will trigger a Stack Overflow." },
      { id: "m7", title: "The Russian Dolls Metaphor", type: "notes", content: "Analogy: Recursion is like opening nested Russian dolls. You keep opening smaller dolls (subproblems) until you reach the tiny solid doll (base case) and then compile the results back up." }
    ]
  },
  {
    id: "cs-binary-trees",
    name: "Binary Trees & BSTs",
    subject: "Computer Science",
    description: "Non-linear data structures where nodes have at most two child branches.",
    parentId: "cs-recursion",
    depth: 4,
    mastery: 30,
    retention: 15,
    daysUntilForget: 1, // High risk of forgetting
    difficulty: "Hard",
    materials: [
      { id: "m8", title: "Binary Search Tree (BST) Properties", type: "notes", content: "Left subtree keys are less than parent key; right subtree keys are greater. This guarantees O(log N) lookup if balanced." }
    ]
  },
  {
    id: "cs-dp",
    name: "Dynamic Programming",
    subject: "Computer Science",
    description: "Optimizing recursive solutions through memoization and tabulation.",
    parentId: "cs-recursion",
    depth: 4,
    mastery: 10,
    retention: 8,
    daysUntilForget: 0, // Needs immediate review!
    difficulty: "Interview-level",
    materials: [
      { id: "m9", title: "Tabulation vs Memoization", type: "concept", content: "Memoization is top-down (saving stack calls); Tabulation is bottom-up (filling arrays iteratively)." },
      { id: "m10", title: "DP Formula Framework", type: "notes", content: "Step 1: Define Subproblems. Step 2: Formulate Recurrence Relation. Step 3: Set Base Cases." }
    ]
  },

  // Subject: Mathematics
  {
    id: "math-root",
    name: "Advanced Mathematics",
    subject: "Mathematics",
    description: "The language of patterns, structures, and system transformations.",
    depth: 0,
    mastery: 55,
    retention: 70,
    daysUntilForget: 8,
    difficulty: "Medium",
    materials: [
      { id: "m11", title: "Mathematics as the Core of AI", type: "concept", content: "Without linear algebra and calculus, modern neural networks cannot compute derivatives or adjust weights." }
    ]
  },
  {
    id: "math-la",
    name: "Linear Algebra",
    subject: "Mathematics",
    description: "Vectors, matrices, and coordinate conversions.",
    parentId: "math-root",
    depth: 1,
    mastery: 40,
    retention: 50,
    daysUntilForget: 3,
    difficulty: "Medium",
    materials: [
      { id: "m12", title: "Vector Spaces Defined", type: "concept", content: "A vector space is a collection of vectors that can be scaled and added together while remaining in the same space." }
    ]
  },
  {
    id: "math-matrices",
    name: "Matrix Transforms",
    subject: "Mathematics",
    description: "Linear mappings stretching, rotating, or scaling space.",
    parentId: "math-la",
    depth: 2,
    mastery: 50,
    retention: 45,
    daysUntilForget: 2,
    difficulty: "Medium",
    materials: [
      { id: "m13", title: "Matrix Multiplication Metaphor", type: "notes", content: "Analogy: Multiplying matrices is like compounding instructions. First matrix says 'rotate 90 degrees', the next says 'double the height'. Combined, they do both in one step!" }
    ]
  },
  {
    id: "math-eigen",
    name: "Eigenvalues & Eigenvectors",
    subject: "Mathematics",
    description: "Vectors that don't change direction under linear transformations.",
    parentId: "math-matrices",
    depth: 3,
    mastery: 20,
    retention: 10,
    daysUntilForget: 1,
    difficulty: "Hard",
    materials: [
      { id: "m14", title: "Why Eigenvalues Matter in PageRank", type: "concept", content: "Google's search algorithm finds eigenvectors of large stochastic matrices to calculate the static probability distribution of landing on pages." }
    ]
  },
  {
    id: "math-calc",
    name: "Calculus",
    subject: "Mathematics",
    description: "The study of continuous rate of change and area accumulation.",
    parentId: "math-root",
    depth: 1,
    mastery: 65,
    retention: 75,
    daysUntilForget: 7,
    difficulty: "Medium",
    materials: [
      { id: "m15", title: "Core Theorem of Calculus", type: "concept", content: "Integration and differentiation are inverse operations. Summing up slices yields total growth." }
    ]
  },
  {
    id: "math-derivatives",
    name: "Derivatives",
    subject: "Mathematics",
    description: "Measuring instantaneous change rates or slopes.",
    parentId: "math-calc",
    depth: 2,
    mastery: 75,
    retention: 80,
    daysUntilForget: 9,
    difficulty: "Easy",
    materials: [
      { id: "m16", title: "Power Rule & Chain Rule", type: "notes", content: "Understanding nested rates: f(g(x)) derivative equals f'(g(x)) * g'(x)." }
    ]
  },
  {
    id: "math-integrals",
    name: "Integrals",
    subject: "Mathematics",
    description: "Summing tiny pieces to measure total accumulation.",
    parentId: "math-calc",
    depth: 2,
    mastery: 42,
    retention: 38,
    daysUntilForget: 2,
    difficulty: "Hard",
    materials: [
      { id: "m17", title: "Integration by Parts Visualizer", type: "concept", content: "Based on the product rule of derivatives, integration by parts is like subtracting an offset rectangle from a large combined region." }
    ]
  },

  // Subject: Learning Psychology
  {
    id: "psy-root",
    name: "Learning Psychology",
    subject: "Learning Psychology",
    description: "Cognitive mechanics governing how humans process and store data.",
    depth: 0,
    mastery: 90,
    retention: 95,
    daysUntilForget: 30,
    difficulty: "Easy",
    materials: [
      { id: "m18", title: "The Brain as a Dynamic Graph", type: "concept", content: "Every time you connect two seemingly unrelated subjects, a physical neural bridge strengthens in your neocortex." }
    ]
  },
  {
    id: "psy-curve",
    name: "The Forgetting Curve",
    subject: "Learning Psychology",
    description: "Hermann Ebbinghaus' landmark discovery of mathematical memory decay.",
    parentId: "psy-root",
    depth: 1,
    mastery: 95,
    retention: 98,
    daysUntilForget: 28,
    difficulty: "Easy",
    materials: [
      { id: "m19", title: "Spaced Repetition Intervals", type: "notes", content: "By recalling information just before it drops out of access, you double the retention time with each spaced interval." }
    ]
  },
  {
    id: "psy-load",
    name: "Cognitive Load Theory",
    subject: "Learning Psychology",
    description: "Managing working memory thresholds to optimize schema builder models.",
    parentId: "psy-root",
    depth: 1,
    mastery: 80,
    retention: 85,
    daysUntilForget: 15,
    difficulty: "Medium",
    materials: [
      { id: "m20", title: "Intrinsic, Extraneous, and Germane Load", type: "concept", content: "Excellent design removes extraneous load (messy layout) and focuses energy on germane load (building schemas)." }
    ]
  }
];

export const INITIAL_LINKS: KnowledgeLink[] = [
  // Computer Science Connections
  { source: "cs-root", target: "cs-python" },
  { source: "cs-python", target: "cs-loops" },
  { source: "cs-python", target: "cs-functions" },
  { source: "cs-functions", target: "cs-recursion" },
  { source: "cs-recursion", target: "cs-binary-trees" },
  { source: "cs-recursion", target: "cs-dp" },

  // Mathematics Connections
  { source: "math-root", target: "math-la" },
  { source: "math-la", target: "math-matrices" },
  { source: "math-matrices", target: "math-eigen" },
  { source: "math-root", target: "math-calc" },
  { source: "math-calc", target: "math-derivatives" },
  { source: "math-calc", target: "math-integrals" },

  // Learning Psychology Connections
  { source: "psy-root", target: "psy-curve" },
  { source: "psy-root", target: "psy-load" },

  // Inter-disciplinary Cross-Links
  { source: "math-matrices", target: "cs-dp" }, // DP optimization often uses matrix properties
  { source: "cs-recursion", target: "math-calc" }, // Recursion relates to math series
  { source: "psy-curve", target: "cs-root" } // Using spaced repetition to study Computer Science
];

export const ALL_BADGES: Badge[] = [
  { id: "b1", name: "Mind Schema Builder", icon: "Brain", description: "Created your unique AI Learning DNA profile." },
  { id: "b2", name: "Recursion Conqueror", icon: "Layers", description: "Mastered concepts down to depth levels." },
  { id: "b3", name: "Memory Champion", icon: "TrendingUp", description: "Maintained active study streak for over 5 days." },
  { id: "b4", name: "High Focus Mode", icon: "Zap", description: "Cleared a hard quiz under high pressure conditions." },
  { id: "b5", name: "Interactive Nomad", icon: "Compass", description: "Saved and bookmarked 3 high-importance concept nodes." }
];
