# 🧠 MentorMind AI – Cognitive Learning Psychologist

> **"It doesn't just answer questions. It understands how you learn."**

[![Live Application](https://img.shields.io/badge/Production--App-mentor--mind--ai--rho.vercel.app-6366F1?style=for-the-badge&logo=vercel)](https://mentor-mind-ai-rho.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemini%202.5-FF6F00?style=for-the-badge&logo=google)](https://ai.google.dev/)

---

## 📌 Executive Summary

Traditional educational platforms and standard AI chatbots operate as **stateless response engines**. Regardless of whether a student is a visual learner, experiencing cognitive fatigue, struggling with mathematical concepts, or prepping for technical interviews, generic LLM interfaces respond with identical explanations.

**MentorMind AI** introduces an active **Cognitive Psychology Engine** between the student and the foundation model. By capturing multi-dimensional telemetry—learning modalities, absorption pace, memory decay curves, and topic dependencies—it continuously adjusts instruction style, difficulty, and intervention timing in real time.

---

## 🏗 System Architecture

```
                               ┌─────────────────────────┐
                               │   Student Interface     │
                               │ (React / Vite / Tailwind)│
                               └────────────┬────────────┘
                                            │
                               Telemetry & User Input
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              MentorMind Cognitive Engine                               │
│                                                                                        │
│   ┌────────────────────────┐  ┌──────────────────────────┐  ┌────────────────────────┐  │
│   │   AI Learning DNA      │  │   Ebbinghaus Retention   │  │   Life-Saver Queue     │  │
│   │   State & Modality     │  │   Decay Predictor        │  │   Friction Scheduler   │  │
│   └───────────┬────────────┘  └────────────┬─────────────┘  └───────────┬────────────┘  │
└───────────────┼────────────────────────────┼────────────────────────────┼───────────────┘
                │                            │                            │
                └──────────────────┐         │         ┌──────────────────┘
                                   ▼         ▼         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Dynamic Context Orchestrator                              │
│       Injects Modality Parameters, Difficulty Tiers, and Prerequisite Remediations     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                Hybrid Engine Layer                                     │
│                                                                                        │
│   ┌────────────────────────┐  ┌──────────────────────────┐  ┌────────────────────────┐  │
│   │   Firebase Backend     │  │   Interactive 3D Graph   │  │   Gemini 2.5 Engine    │  │
│   │   Telemetry & State    │  │   Node Topology (Three)  │  │   Adaptive LLM Core    │  │
│   └────────────────────────┘  └──────────────────────────┘  └────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Core Features & Platform Capabilities

### 1. 🧬 AI Learning DNA Configuration
Builds a persistent, diagnostic vector profile for every student:
* **Modality Alignment:** Toggle between `Visual`, `Auditory`, `Read/Write`, and `Kinesthetic` learning pathways.
* **Absorption Pace Telemetry:** Configurable between `Slow & Steady`, `Moderate`, and `Fast-Paced` intake speeds.
* **Dynamic Skill Tracking:** Monitors **Cognitive Strengths** (*Recursive flows*, *Algorithmic thinking*, *Visual graphs*) and **Identified Weaknesses** (*Mathematics definitions*, *Binary tree structures*) in real time.

### 2. 🗺️ Live Topological Knowledge Map
Replaces static linear chapters with an interactive dependency graph across primary subject domains (`Computer Science`, `Mathematics`, `Learning Psychology`):
* **Real-time Node Metrics:** Instant visual feedback on overall **Mastery Index** (e.g., 59%) and **Retention Average** (e.g., 72%).
* **Visual Concept Nodes:** Dynamic scaling and color-coding based on node mastery (e.g., *Python Programming*, *Dynamic Programming*, *Eigenvalues & Eigenvectors*, *Calculus*).
* **Interactive Navigation:** Supports full drag, rotation, and multi-tier zoom controls for exploring prerequisites powered by **Three.js**.

### 3. ⚡ Life-Saver Action Queue
A daily proactive scheduler designed by learning psychologists to bypass study friction and procrastination:
* **Retention Interventions:** Triggers timed micro-reviews when retention crosses critical decay thresholds (*"Stop Retention Decay: Dynamic Programming (15 MIN)"*).
* **Proactive Outline Generators:** Auto-generates low-cognitive-load cheat sheets tailored to modality (*"Draft Cheat-Sheet: Dynamic Programming"*).
* **Mastery Reinforcement:** Direct access to targeted *Boss Quizzes* to solidify neural recall.
* **Stress Reduction Tracker:** Measures daily completion of friction-reduction tasks.

### 4. 📉 Predictive Ebbinghaus Retention Engine
Implements mathematical memory decay modeling to forecast retention loss before it impacts performance:
* Plots recall decay trajectories from `Day 0 (Studied)` to `Recall Threshold (Critical)`.
* Automatically queues review sessions prior to memory dip windows.

### 5. 🎯 Multi-Tier Adaptive Cognitive Difficulty
Dynamically adjusts conceptual complexity across 4 discrete tiers:
Adapts problem formulation, hints, and code examples based on historic latency and attempt accuracy.

### 6. 🤖 Adaptive AI Psychologist
An interactive conversational mentor powered by Gemini 2.5:
* Modality-aware explanations utilizing visual diagrams, step-by-step logic flows, and real-life analogies.
* Integrated self-healing logic with single-click psychology DNA re-generation on latency blocks.

### 7. 🏆 Gamification & Progression Tracking
* **Profile Telemetry:** Levels (e.g., *Lv. 3*), XP metrics (e.g., *240 XP*), and active **Daily Streaks** (e.g., *5 Days*).
* **Badges & Bookmarks:** Unlocked achievement tracking and instant concept bookmarking for rapid review.

### 8. 🔐 Dual Access Portals
* **Student Space:** Full access to interactive knowledge graphs, action queues, and dynamic DNA configuration.
* **Teacher Portal:** Administrative overview for tracking class friction, common weak spots, and intervention analytics.

---

## 🛠 Tech Stack Matrix

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript | Client UI, fast HMR, component state management |
| **Styling & Motion** | Tailwind CSS v4, Framer Motion | Modern dark-mode interface, glassmorphism, dynamic transitions |
| **Graph Visualization** | Three.js | 3D Interactive knowledge graph rendering |
| **Backend API** | Node.js, Express | API routing, server-side Gemini orchestration |
| **AI / Orchestration** | Google Gemini 2.5 (`@google/genai`) | Cognitive dynamic prompting, streaming chat responses |
| **Database & Auth** | Firebase (Firestore & Auth) | User telemetry, auth state, and progress tracking |

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **API Key**: Google Gemini API Key
* **Firebase Project**: A Firebase web project with Firestore enabled

### 1. Repository Clone
```bash
git clone https://github.com/your-username/mentormind-ai.git
cd mentormind-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a local `.env` file based on the example:
```bash
cp .env.example .env
```
Update your `.env` file with the required keys:
```env
GEMINI_API_KEY="your_gemini_api_key"
VITE_FIREBASE_API_KEY="your_firebase_api_key"
```

### 4. Run Development Server
The project uses a unified Vite and Express setup for rapid development.
```bash
npm run dev
```

Navigate to `http://localhost:3000` to access the application locally.

---

## 🗺️ Product Roadmap

- [x] **v1.0 (Current):** Learning DNA Config, Live Knowledge Map, Action Queue, Adaptive Gemini 2.5 Integration.
- [ ] **v1.5 (In Development):** Real-time Affective Vision Engine (webcam-based confusion and fatigue detection using MediaPipe).
- [ ] **v2.0 (Planned):** LMS Integration (Canvas / Blackboard LTI v1.3) and Automated Parent/Teacher Remediation Reports.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  <b>Built for Next-Generation Autonomous Learning</b><br>
  <a href="https://mentor-mind-ai-rho.vercel.app/">Access the MentorMind AI Live Application</a>
</p>
