// This file provides a service for interacting with the Gemini API

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

export const fetchFromGemini = async (prompt: string): Promise<any> => {
  const API_KEY=import.meta.env.VITE_GEMINI_API_KEY
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

export const generateQuizQuestions = async (
  category: string, 
  difficulty: string,
  count: number = 5
): Promise<QuizQuestion[]> => {
  const prompt = `Generate ${count} multiple-choice quiz questions about ${category} programming language at ${difficulty} difficulty level. 
  Each question should have 4 options with only one correct answer. 
  Make sure questions and options are specifically about ${category} concepts, syntax, and best practices.
  Do not use generic placeholders like "Option A" - provide real content for each answer.
  Format the response as a JSON array with the following structure for each question:
  {
    "question": "Detailed question about ${category} here?",
    "options": ["First real option", "Second real option", "Third real option", "Fourth real option"],
    "correctAnswer": "The correct option text here",
    "difficulty": "${difficulty}",
    "explanation": "Brief explanation of why the answer is correct"
  }`;

  try {
    const response = await fetchFromGemini(prompt);
    
    // Extract the text from the response
    const text = response.candidates[0].content.parts[0].text;
    
    // Find the JSON array in the text (in case there's explanatory text around it)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const parsedQuestions = JSON.parse(jsonMatch[0]);
      
      // Validate and format questions
      return parsedQuestions.map((q: any, index: number) => ({
        id: `${category}-${difficulty}-${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        explanation: q.explanation || "No explanation provided"
      }));
    } else {
      throw new Error("Could not parse questions from Gemini response");
    }
  } catch (error) {
    console.error("Failed to generate questions:", error);
    // Return fallback questions in case of error
    return generateFallbackQuestions(category, difficulty as 'easy' | 'medium' | 'hard', count);
  }
};

// Create fallback questions in case the API fails
const generateFallbackQuestions = (category: string, difficulty: 'easy' | 'medium' | 'hard', count: number): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  
  // Pre-defined questions for common programming languages
  const fallbackData: Record<string, QuizQuestion[]> = {
    javascript: [
      {
        id: 'js1',
        question: "Which method is used to add an element to the end of an array in JavaScript?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: "push()",
        difficulty: "easy",
        explanation: "The push() method adds elements to the end of an array and returns the new length."
      },
      {
        id: 'js2',
        question: "What does 'use strict' do in JavaScript?",
        options: [
          "Enables strict typing", 
          "Enforces stricter parsing and error handling", 
          "Allows use of undeclared variables", 
          "Makes the code run faster"
        ],
        correctAnswer: "Enforces stricter parsing and error handling",
        difficulty: "medium",
        explanation: "Strict mode catches common coding mistakes and prevents unsafe actions."
      },
      {
        id: 'js3',
        question: "What is a closure in JavaScript?",
        options: [
          "A function that has access to its outer function's scope", 
          "A way to close browser tabs using JavaScript", 
          "A method to terminate function execution", 
          "A data structure for storing key-value pairs"
        ],
        correctAnswer: "A function that has access to its outer function's scope",
        difficulty: "hard",
        explanation: "Closures allow a function to access variables from its outer scope even after the outer function has finished executing."
      },
    ],
    python: [
      {
        id: 'py1',
        question: "What is the correct way to create a list in Python?",
        options: ["[1, 2, 3]", "{1, 2, 3}", "(1, 2, 3)", "<1, 2, 3>"],
        correctAnswer: "[1, 2, 3]",
        difficulty: "easy",
        explanation: "Square brackets [] are used to create lists in Python."
      },
      {
        id: 'py2',
        question: "What does the 'self' parameter in Python class methods represent?",
        options: [
          "A reference to the instance of the class", 
          "A way to make methods private", 
          "A special Python keyword for error handling", 
          "A reference to the class itself, not its instances"
        ],
        correctAnswer: "A reference to the instance of the class",
        difficulty: "medium",
        explanation: "Self refers to the instance of the class and is used to access variables and methods of the class."
      },
      {
        id: 'py3',
        question: "What is a decorator in Python?",
        options: [
          "A function that takes another function and extends its behavior", 
          "A design pattern for styling Python applications", 
          "A special data type for storing function references", 
          "A tool for documenting Python code"
        ],
        correctAnswer: "A function that takes another function and extends its behavior",
        difficulty: "hard",
        explanation: "Decorators allow you to modify or extend the behavior of functions or methods without changing their implementation."
      },
    ],
    react: [
      {
        id: 'react1',
        question: "What is JSX in React?",
        options: [
          "JavaScript XML", 
          "JavaScript Extension", 
          "JavaScript Syntax", 
          "JavaScript eXtreme"
        ],
        correctAnswer: "JavaScript XML",
        difficulty: "easy",
        explanation: "JSX is a syntax extension for JavaScript that looks similar to HTML and makes it easier to write React components."
      },
      {
        id: 'react2',
        question: "What hook is used to perform side effects in a functional component?",
        options: [
          "useEffect", 
          "useState", 
          "useContext", 
          "useReducer"
        ],
        correctAnswer: "useEffect",
        difficulty: "medium",
        explanation: "useEffect handles side effects like data fetching, subscriptions, or DOM manipulations in functional components."
      },
      {
        id: 'react3',
        question: "What is the virtual DOM in React?",
        options: [
          "A lightweight copy of the actual DOM", 
          "A special browser mode for React", 
          "A visual DOM editor", 
          "A deprecated feature in React"
        ],
        correctAnswer: "A lightweight copy of the actual DOM",
        difficulty: "hard",
        explanation: "React creates a virtual representation of the UI to minimize direct manipulation of the DOM, improving performance."
      },
    ],
  };
  
  // Get questions for the specific category if available
  let categoryQuestions = fallbackData[category] || [];
  
  // If not enough category-specific questions, add generic coding questions
  if (categoryQuestions.length < count) {
    const genericQuestions: QuizQuestion[] = [
      {
        id: 'generic1',
        question: `What is a common use case for ${category}?`,
        options: [
          `Building web applications`, 
          `Data analysis and scientific computing`, 
          `System programming and automation`, 
          `Mobile app development`
        ],
        correctAnswer: categoryQuestions.length > 0 ? categoryQuestions[0].options[0] : `Building web applications`,
        difficulty: difficulty,
        explanation: `${category} is commonly used for various programming tasks including web development.`
      },
      {
        id: 'generic2',
        question: `Which of the following is a best practice in ${category}?`,
        options: [
          `Writing clear and readable code`, 
          `Using as few comments as possible`, 
          `Nesting functions as deeply as possible`, 
          `Avoiding version control`
        ],
        correctAnswer: `Writing clear and readable code`,
        difficulty: difficulty,
        explanation: `Writing clear and readable code is a universal best practice in all programming languages including ${category}.`
      },
    ];
    
    categoryQuestions = [...categoryQuestions, ...genericQuestions];
  }
  
  // Filter by difficulty if possible
  const filteredByDifficulty = categoryQuestions.filter(q => q.difficulty === difficulty);
  
  // If we have enough questions of the requested difficulty, use those
  if (filteredByDifficulty.length >= count) {
    return filteredByDifficulty.slice(0, count);
  }
  
  // Otherwise, use a mix of difficulties
  return categoryQuestions.slice(0, count);
};

export const getAnswerFeedback = async (
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<string> => {
  const prompt = `Question: "${question}"
  User's answer: "${userAnswer}"
  Correct answer: "${correctAnswer}"
  
  Provide brief, helpful feedback (max 2 sentences) on why the answer is correct or incorrect, and include a helpful tip for remembering this knowledge.`;

  try {
    const response = await fetchFromGemini(prompt);
    return response.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Failed to get answer feedback:", error);
    return "Unable to generate feedback for this answer. Please try again later.";
  }
};

export const getStudyRecommendations = async (
  category: string,
  weakAreas: string[]
): Promise<string[]> => {
  const prompt = `Based on quiz performance in ${category}, the user is struggling with these concepts: ${weakAreas.join(", ")}.
  
  Provide 3 specific, focused study recommendations to help them improve in these areas. Each recommendation should be brief (max 1 sentence) and actionable.`;

  try {
    const response = await fetchFromGemini(prompt);
    const text = response.candidates[0].content.parts[0].text;
    
    // Split by numbered list (1., 2., 3.) or bullet points and clean up
    return text
      .split(/\d+\.\s+|\n\s*[-•]\s+|\n+/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .slice(0, 3);
  } catch (error) {
    console.error("Failed to get study recommendations:", error);
    return ["Review key concepts in textbooks or online resources.", 
            "Practice with additional quizzes on the topic.", 
            "Consider watching educational videos on the subject."];
  }
};
