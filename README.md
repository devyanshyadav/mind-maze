# Mind Maze

![Mind Maze Banner](/public/banner.png)

## 🧠 Adaptive Programming Quiz Platform

Mind Maze is an intelligent quiz application designed to help developers master programming languages, frameworks, and development concepts through personalized learning paths and comprehensive analytics.


## ✨ Features

- **Adaptive Difficulty Paths** - Questions dynamically adjust based on your performance, creating a personalized learning journey for each user
- **Visual Knowledge Map** - Interactive visualization of your strengths and weaknesses across programming topics
- **Time-Based Challenge Modes** - Multiple quiz modes including Speed Rush, Standard, and Deep Dive for different learning styles
- **Comprehensive Analytics** - Track your progress with detailed performance metrics and visualizations
- **Programming Categories** - Cover a wide range of topics including:
  - Programming languages (JavaScript, Python, Java, etc.)
  - Web frameworks (React, Vue, Angular, etc.)
  - Backend technologies (Node.js, Django, Spring, etc.)
  - Database systems (SQL, MongoDB, etc.)
  - DevOps & cloud platforms
- **Customizable Experience** - Select difficulty levels, number of questions, and time limits
- **Local Storage** - All your progress and settings are saved locally for a seamless experience

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/devyanshyadav/mind-maze.git
   cd mind-maze
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory based on `.env.example`
   - Add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=myapikey
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or with yarn
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`



### Quiz Interface

The main quiz interface allows users to:
- Select programming categories
- Choose difficulty levels (Easy, Medium, Hard, or Adaptive)
- Set the number of questions
- Select time limits per question
- View questions with multiple-choice answers

### Knowledge Map

The Knowledge Map visualizes your:
- Proficiency across programming topics
- Areas of strength and weakness
- Progress over time
- Topic relationships and connections

### Analytics Dashboard

Comprehensive analytics including:
- Performance metrics (accuracy, speed, consistency)
- Progress tracking over time
- Comparative analysis against previous attempts
- Detailed breakdown by topic and difficulty

## 🔌 API Integration

Mind Maze uses the Gemini API to:
- Generate dynamic questions based on selected topics and difficulty
- Provide intelligent feedback on user answers
- Suggest personalized learning paths based on performance

Example API usage:

```typescript
const fetchQuestions = async (topic: string, difficulty: string, count: number) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Generate ${count} multiple-choice ${difficulty} level questions about ${topic} for programmers.` 
          }]
        }]
      }),
    }
  );
  return await response.json();
};
```
---

Built with ❤️ by Devyansh Yadav