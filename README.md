# MOCKIFY AI Interview Assistant

Master your interviews with AI — practice smarter, perform better.

## 🚀 Overview
MOCKIFY is a comprehensive AI-driven interview preparation platform designed to help job seekers build confidence and hone their skills. It features real-time voice interviews, chat-based practice, and a sophisticated performance analysis engine.

## 🛠️ Key Features
1.  **AI Voice Interview**: A low-latency, real-time voice interaction system powered by Gemini 3.1 Flash Live.
2.  **Interview Preparation (Chat)**: A chat-based simulation where users can practice answering industry-specific questions.
3.  **Performance Analysis**: Instant feedback, ratings (1-10), and actionable improvement tips after each session.
4.  **Notes System**: A built-in note-taking tool to jot down key points and preparation strategies.
5.  **Authentication System**: Secure login and signup using Firebase Authentication (Google Login).
6.  **Responsive Design**: A modern, Red & White themed UI with full Dark Mode support, optimized for all devices.

---

## 🏗️ Architecture & Technologies

### 🎨 Frontend
The frontend is built with **React 18+** and **Vite**, focusing on performance and a seamless user experience.
-   **Tailwind CSS v4**: Used for modern, utility-first styling with a custom Red & White theme.
-   **Framer Motion**: Powering high-performance animations and smooth page transitions.
-   **Lucide React**: Providing a consistent and beautiful icon set.
-   **Theme Management**: A persistent dark/light mode toggle using React state and `localStorage`.

### 🔒 Backend
The backend leverages **Firebase** for a scalable, serverless architecture.
-   **Firebase Authentication**: Secure user management with Google OAuth integration.
-   **Cloud Firestore**: A real-time NoSQL database for storing user profiles, interview history, and notes.
-   **Security Rules**: Enterprise-grade data protection using ownership-based access control (RBAC).

### 🤖 Artificial Intelligence
The core intelligence is powered by **Google Gemini** models.
-   **Gemini 3.1 Flash Live**: Optimized for low-latency, real-time multimodal (voice) interactions.
-   **Gemini 3.0 Flash**: Used for chat-based practice and generating detailed performance reports.
-   **Web Audio API**: Capturing and processing microphone input (PCM at 16kHz) for the AI model.
-   **WebSockets**: Enabling bidirectional, real-time data streaming between the client and Gemini.

---

## 🧩 Component Breakdown
-   **`App.tsx`**: Central hub for routing, theme state, and navigation.
-   **`Home.tsx`**: Landing page featuring the hero section and core value proposition.
-   **`Auth.tsx`**: Secure entry point for user authentication.
-   **`VoiceInterview.tsx`**: The flagship feature—a real-time voice interface for mock interviews.
-   **`ChatInterview.tsx`**: A focused environment for industry-specific chat-based practice.
-   **`Notes.tsx`**: A productivity tool for capturing interview insights.
-   **`About.tsx`**: Detailed overview of the platform's mission and technical capabilities.

---

## 🛡️ Security Implementation
MOCKIFY follows the "Default Deny" principle:
-   **Ownership-Based Access**: Users can only access documents where the `uid` matches their authenticated `request.auth.uid`.
-   **Data Validation**: Strict schema enforcement within Firestore Security Rules to prevent data corruption or malicious writes.
-   **Secure API Handling**: All AI interactions are handled through the official `@google/genai` SDK with secure environment variable management.

---

## 💼 Resume Points
*   **AI-Powered Interview Platform**: Developed a full-stack interview preparation tool using React and Firebase, integrating Gemini 3.1 Flash Live for real-time, low-latency voice interactions.
*   **Real-Time Feedback System**: Implemented an automated performance analysis engine that provides users with instant feedback, ratings, and improvement tips after each mock interview.
*   **Modern Responsive UI**: Designed and built a highly responsive, themeable user interface using Tailwind CSS v4 and Framer Motion, featuring a persistent dark/light mode toggle.

---

## ❓ Potential Interview Questions
1.  **"How did you handle real-time voice interactions?"**
    *   *Answer*: I used the Gemini 3.1 Flash Live API. I implemented the Web Audio API on the frontend to capture microphone input, encode it to PCM, and stream it via WebSockets to the AI model.
2.  **"How is the data secured in your application?"**
    *   *Answer*: I used Firebase Security Rules to ensure that users can only read and write their own data. Access is controlled by checking the `request.auth.uid` against the document's owner ID.
3.  **"Why did you choose Firebase for the backend?"**
    *   *Answer*: Firebase provided a quick and scalable way to handle authentication and real-time data synchronization, allowing me to focus on the core AI features.
4.  **"How did you implement the dark mode toggle?"**
    *   *Answer*: I used React state to manage the theme preference and persisted it in `localStorage`. I then used a `useEffect` hook to apply the `.dark` class to the `html` element.
5.  **"What was the biggest challenge you faced?"**
    *   *Answer*: Managing the state of the real-time voice stream while ensuring the UI remained responsive. I had to carefully handle audio buffers and WebSocket events to prevent lag.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Cloud Project with Gemini API enabled
- A Firebase Project

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`:
   ```env
   GEMINI_API_KEY=your_api_key
   ```
4. Start the development server: `npm run dev`
