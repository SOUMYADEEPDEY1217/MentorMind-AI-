import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client with graceful fallback
let aiClient: GoogleGenAI | null = null;
function getGemini() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or contains placeholder. Fallback mode is enabled.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust fallback wrapper around generateContent to try working models first
async function generateContentWithFallback(ai: GoogleGenAI, params: { contents: any; config?: any }) {
  const modelOptions = ["gemini-3.1-flash-lite", "gemini-3.5-flash"];
  let lastError = null;
  for (const modelName of modelOptions) {
    try {
      console.info(`Attempting content generation with model: ${modelName}`);
      const response = await ai.models.generateContent({
        ...params,
        model: modelName,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${modelName} failed:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

// Helper function to generate high-fidelity explanation fallback
function generateExplainFallback(topicName: string, profile: any, difficulty: string, isQuotaError = false) {
  const reason = isQuotaError ? "Gemini API Quota Exceeded (429 Limit)" : "Gemini API Temporarily Offline";
  return {
    explanation: `### 🧠 Adaptive Explanation: ${topicName} (${difficulty} Level)
    
*⚠️ Note: ${reason}. Activated offline psychologist tutor engine for uninterrupted learning.*

#### 🧬 Personalized Learning Analysis
* **Learning Style:** **${profile?.style || "Visual"}**
* **Absorption Pace:** **${profile?.speed || "Moderate"}**

Since you are a **${profile?.style || "Visual"}** learner, let's represent the core machinery of **${topicName}** visually:

\`\`\`
  [Starting Input Data]
           │
           ▼
┌──────────────────────┐
│  Adaptive Processor  │  ◄───  Recurrent Memory Loop
└──────────────────────┘
           │
           ▼
   [Refined Concept]
\`\`\`

#### 📖 Intuitive Analogy
Imagine organizing books in a high-density library. Instead of placing them on random shelves (high cognitive load), you construct an elegant, color-coded index layout. Each shelf holds related ideas, matching how your brain organizes **${topicName}**.

#### 🎯 Core Concept Insights (Difficulty: ${difficulty})
1. **Structural Boundaries:** At the **${difficulty}** tier, you need to master the exact transition mechanisms and edge conditions.
2. **Memory Triggers:** To commit this to your long-term memory, tie this to existing knowledge in your active profile strengths (**${profile?.strengths?.join(", ") || "analytical logic"}**).

---
**Next Best Action:** I have generated an adaptive quiz specifically targeting this explanation. Select the **Boss Quiz Station** tab to test your cognitive retention index!`,
    adaptiveTips: "Your current mental receptive index is high. Try taking a quick concept verification quiz."
  };
}

// Helper function to generate high-fidelity quiz fallback
function generateQuizFallback(topicName: string, profile: any, difficulty: string, isQuotaError = false) {
  const reason = isQuotaError ? "Gemini Quota Exceeded" : "Gemini Offline";
  return {
    quiz: [
      {
        id: "q_fallback_1",
        question: `[⚠️ ${reason}] At the ${difficulty} tier, which approach best reduces memory decay for ${topicName}?`,
        options: [
          "Relying on raw syntax memorization of code templates",
          "Building customized high-contrast mental models and interactive analogies",
          "Postponing self-testing until exam day",
          "Reading abstract theoretical textbooks without active recall"
        ],
        correctAnswer: 1,
        explanation: "Active recall combined with custom visual analogies enhances neurological retention by up to 150%, which perfectly matches your cognitive style.",
        taxonomyLevel: "Apply & Optimize"
      },
      {
        id: "q_fallback_2",
        question: `Given your profile (${profile?.style || "Visual"} Style, ${profile?.speed || "Moderate"} Pace), what is the optimal way to overcome weaknesses in [${profile?.weaknesses?.join(", ") || "abstract definitions"}]?`,
        options: [
          "Skipping difficult nodes on the knowledge map entirely",
          "Slowing down to a crawl and avoiding quiz assessments",
          "Tackling step-by-step adaptive questions scaled from Easy to Interview-level",
          "Studying in high-distraction environments"
        ],
        correctAnswer: 2,
        explanation: "Shattering complex blocks into targeted cognitive tiers prevents cognitive fatigue and builds strong neurological memory pathways.",
        taxonomyLevel: "Evaluate & Connect"
      },
      {
        id: "q_fallback_3",
        question: `How does the predictive forgetting curve help you master ${topicName} in the long run?`,
        options: [
          "It reminds you to study right before your memory strength drops to zero",
          "It advises you to restudy the topic every hour forever",
          "It has no scientific basis for memory retention",
          "It forces you to take multiple long quizzes daily"
        ],
        correctAnswer: 0,
        explanation: "By predicting the precise interval before recall probability drops below 50%, we schedule reminders at the absolute peak of active reinforcement.",
        taxonomyLevel: "Analyze & Retain"
      }
    ]
  };
}

// Helper function to generate high-fidelity chat fallback
function generateChatFallback(message: string, profile: any, isQuotaError = false) {
  const reason = isQuotaError ? "Gemini API Quota Limit reached (429)" : "Gemini API offline";
  return {
    text: `🧠 **MentorMind Learning Psychologist (Tutor Mode)**
    
*⚠️ Note: ${reason}. Switched to local adaptive response mode to support your learning without interruption.*

I hear you! You asked: "${message}"

Let's analyze this using your unique **Learning DNA Profile**:
- **Learning Style:** **${profile?.style || "Visual"}** (we will focus on diagrams, step-by-step structured structures)
- **Absorption Pace:** **${profile?.speed || "Moderate"}**

#### 🔬 Educational Psychologist Strategy
To understand this concept effectively given your style, we need to bridge your strength (**${profile?.strengths?.join(", ") || "Analytical Reasoning"}**) and mitigate your weakness (**${profile?.weaknesses?.join(", ") || "Abstract Memorization"}**). 

Here is the key breakdown:
1. **Step-by-step Analogy:** Think of this like building a physical prototype. Instead of reading assembly manuals, you inspect the 3D model (like our interactive Knowledge Map above) to map out how nodes connect.
2. **Memory Anchor:** Associate this with your prior mastery index. You have successfully conquered related nodes, meaning you already possess the neural scaffolding required to grasp this!

---
**Next Best Action:** Would you like to generate a localized 3-question evaluation quiz to lock in this segment, or should we adjust your target cognitive difficulty tier?`
  };
}

// Helper to determine if an error is due to Gemini API limits/quota
function checkIsQuotaOrApiError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || "").toLowerCase();
  const status = String(error.status !== undefined && error.status !== null ? error.status : "").toLowerCase();
  let stringified = "";
  try {
    stringified = JSON.stringify(error).toLowerCase();
  } catch (e) {
    stringified = String(error).toLowerCase();
  }
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("exhausted") ||
    status.includes("429") ||
    status.includes("resource_exhausted") ||
    stringified.includes("429") ||
    stringified.includes("quota") ||
    stringified.includes("resource_exhausted")
  );
}

// 1. Adaptive Explanation API
app.post("/api/explain", async (req, res) => {
  const { topicName, profile, difficulty } = req.body;
  const ai = getGemini();

  if (!ai) {
    return res.json(generateExplainFallback(topicName, profile, difficulty, false));
  }

  try {
    const prompt = `You are MentorMind AI, an expert AI learning psychologist.
Explain the topic: "${topicName}"
Difficulty Level: "${difficulty}"
Student Learning DNA Profile:
- Learning Style: ${profile?.style || "Visual (likes diagrams, flowcharts, ASCII visual models)"}
- Learning Speed: ${profile?.speed || "Moderate"}
- Strength: ${profile?.strengths?.join(", ") || "General reasoning"}
- Repeated Weaknesses: ${profile?.weaknesses?.join(", ") || "Theoretical abstract definitions without code examples"}

Provide a highly personalized explanation that speaks directly to their learning style. 
If they are a Visual learner, use clean ASCII flowcharts or structural tables.
If they are slow in mathematics, explain mathematical aspects with intuitive real-life analogies rather than heavy jargon.
Always include:
1. A tailored "Learning Pathway Insight" based on their profile.
2. A clear real-life analogy.
3. A core concept explanation tuned to the chosen difficulty level (${difficulty}).
4. Use rich Markdown format with clean headers.
5. End with a singular "Next Best Action" prompt to minimize cognitive load.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are MentorMind AI, the world's leading educational psychologist. You don't just answer questions, you adapt your tone, explanation density, visual models, and vocabulary to the student's unique learning DNA."
      }
    });

    res.json({
      explanation: response.text || "Could not generate explanation.",
      adaptiveTips: `Adaptive style: focused on ${profile?.style || "Visual"} styling with ${difficulty} progression.`
    });
  } catch (error: any) {
    console.error("Gemini explanation error:", error);
    console.info("Gemini explanation offline fallback mode activated.");
    const isQuota = checkIsQuotaOrApiError(error);
    // Graceful high-fidelity fallback to keep student focus active
    return res.json(generateExplainFallback(topicName, profile, difficulty, isQuota));
  }
});

// 2. AI Question Generator API (Bloom's Taxonomy / Adaptive Quizzes)
app.post("/api/generate-quiz", async (req, res) => {
  const { topicName, profile, difficulty } = req.body;
  const ai = getGemini();

  if (!ai) {
    return res.json(generateQuizFallback(topicName, profile, difficulty, false));
  }

  try {
    const prompt = `Generate a 3-question adaptive quiz for the topic "${topicName}" at difficulty level "${difficulty}".
Target student style is: ${profile?.style || "Visual"}.
Generate questions that adhere to Bloom's Taxonomy (e.g., test Understanding, Application, or Analysis).
Return exactly a JSON array containing objects with this schema:
[
  {
    "id": "string (unique)",
    "question": "string",
    "options": ["array of 4 strings"],
    "correctAnswer": 0 (index of correct option, 0-3),
    "explanation": "string explaining why this is correct and connecting to educational psychology",
    "taxonomyLevel": "string (e.g., Remember, Understand, Apply, Analyze, Evaluate)"
  }
]`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              taxonomyLevel: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation", "taxonomyLevel"]
          }
        }
      }
    });

    const quizData = JSON.parse(response.text || "[]");
    res.json({ quiz: quizData });
  } catch (error: any) {
    console.info("Gemini quiz generation offline fallback mode activated.");
    const isQuota = checkIsQuotaOrApiError(error);
    // Graceful high-fidelity fallback for uninterrupted study
    return res.json(generateQuizFallback(topicName, profile, difficulty, isQuota));
  }
});

// 3. AI Mentor Chat API
app.post("/api/chat-mentor", async (req, res) => {
  const { message, chatHistory, profile } = req.body;
  const ai = getGemini();

  if (!ai) {
    return res.json(generateChatFallback(message, profile, false));
  }

  try {
    const systemInstruction = `You are MentorMind AI, the world's first AI Learning Psychologist.
Your student has the following Learning DNA profile:
- Style: ${profile?.style || "Visual"}
- Learning Speed: ${profile?.speed || "Moderate"}
- Strengths: ${profile?.strengths?.join(", ") || "N/A"}
- Weaknesses: ${profile?.weaknesses?.join(", ") || "N/A"}

Your goal is NOT just to give direct, flat solutions, but to explain like an empathetic, firm tutor.
If they say "I don't understand" or ask a question, adjust your response:
- Use analogies matching their profile.
- Highlight their strengths.
- Be encouraging, concise, and structured.
- End your response with a singular "Next Best Action" prompt to guide them.`;

    const chatMessages = (chatHistory || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.text }]
    }));

    // Add current message
    chatMessages.push({
      role: "user" as const,
      parts: [{ text: message }]
    });

    const response = await generateContentWithFallback(ai, {
      contents: chatMessages,
      config: {
        systemInstruction
      }
    });

    res.json({ text: response.text || "I am listening! Let's work on this topic step-by-step." });
  } catch (error: any) {
    console.info("Gemini chat offline fallback mode activated.");
    const isQuota = checkIsQuotaOrApiError(error);
    // Graceful high-fidelity chat fallback
    return res.json(generateChatFallback(message, profile, isQuota));
  }
});

// Helper for generating teacher classroom resource fallbacks
function generateTeacherResourceFallback(topicName: string, targetGroup: string, resourceType: string, difficulty: string, isQuotaError = false) {
  const reason = isQuotaError ? "Gemini API Quota Exceeded (429 Limit)" : "Gemini API Offline Mode Enabled";
  return {
    resource: `### 🎓 Class Remediation Resource: ${topicName} (${difficulty} Level)
    
*⚠️ Note: ${reason}. Active local fallback generator initialized for classroom continuity.*

#### 🎯 Target Cohort: **${targetGroup}**
#### 📋 Resource Category: **${resourceType}**

---

##### 🔑 Part 1: Strategic Learning Objectives
1. **Core Insight:** Ground theoretical definitions in active real-world paradigms. This specifically supports students within the **${targetGroup}** cohort who exhibit memory decay under study stress.
2. **Mastery Anchor:** Bypass traditional brute-force coding sheets. Instead, use systematic visualization schemas to build cognitive frameworks.

##### 🚀 Part 2: The ${resourceType === "Metaphor Cheat-Sheet" ? "Intuitive Metaphor" : "Structured Explanation"}
Imagine **${topicName}** as an assembly line in a state-of-the-art warehouse. 
* Rather than stacking packages arbitrarily, the warehouse utilizes a sorted, dynamic tray matrix.
* Each tray is self-addressable, ensuring that retrieval speeds remain optimized even under heavy workloads.
* This is critical at the **${difficulty}** level where scale and bottleneck prevention are paramount.

##### 📝 Part 3: Adaptive Checklist & Study Strategy
* [ ] **Step 1:** Draft the structural layout representing ${topicName} (ideally using ASCII blocks or mental trees).
* [ ] **Step 2:** Formulate custom self-retrieval questions to bypass passive reading.
* [ ] **Step 3:** Trigger a short concept quiz inside the Active Studio to certify 80%+ mastery!

---
*Created by MentorMind Instructor AI Studio.*`
  };
}

// 4. AI Teacher Resource Generator API
app.post("/api/teacher/generate-resource", async (req, res) => {
  const { topicName, targetGroup, resourceType, difficulty } = req.body;
  const ai = getGemini();

  if (!ai) {
    return res.json(generateTeacherResourceFallback(topicName, targetGroup, resourceType, difficulty, false));
  }

  try {
    const prompt = `You are MentorMind AI, the world's leading educational psychologist and curriculum developer.
Generate a high-fidelity classroom remediation resource for the topic "${topicName}" at difficulty level "${difficulty}".
Target Cohort of Students: "${targetGroup}" (e.g., Visual Learners, At-Risk Students, High Performers, General Class)
Resource Category: "${resourceType}" (e.g., Practice Handout, Metaphor Cheat-Sheet, Syllabus Checklist)

Please structure the document using professional markdown with headers, bullet points, and high contrast spacing.
1. Start with a prominent title.
2. Provide a section highlighting key educational objectives tailored to "${targetGroup}" to mitigate their learning bottlenecks.
3. Include an engaging explanation of "${topicName}" matching the "${resourceType}" format. (e.g., if Metaphor Cheat-Sheet, write a creative, deep physical metaphor with full details; if Syllabus Checklist, provide sequential checkboxes).
4. Outline a quick "Checklist & Actionable Roadmap" for the student to complete.
5. End with a singular inspirational closing line that builds teacher-student alignment.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are MentorMind AI's Instructor Resource Suite. You specialize in creating highly engaging, clear, and pedagogically robust materials that transform dry engineering topics into intuitive learning guides."
      }
    });

    res.json({
      resource: response.text || "Could not generate classroom resource."
    });
  } catch (error: any) {
    console.info("Gemini teacher resource generation offline fallback mode activated.");
    const isQuota = checkIsQuotaOrApiError(error);
    return res.json(generateTeacherResourceFallback(topicName, targetGroup, resourceType, difficulty, isQuota));
  }
});

// Serve static assets and Vite SPA middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MentorMind AI server running on http://localhost:${PORT}`);
  });
}

startServer();
