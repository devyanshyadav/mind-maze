
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, HelpCircle, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateQuizQuestions, QuizQuestion } from '@/routes/GeminiService';

interface QuizComponentProps {
  mode: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit: number;
  onBack: () => void;
  onComplete: (results: QuizResult) => void;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  timeElapsed: number;
  difficultyLevels: { easy: number; medium: number; hard: number };
  answers: { question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean; timeSpent: number }[];
}

const QuizComponent: React.FC<QuizComponentProps> = ({ 
  mode, 
  category, 
  difficulty,
  questionCount,
  timeLimit,
  onBack, 
  onComplete 
}) => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [quizStartTime, setQuizStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult>({
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    skippedQuestions: 0,
    timeElapsed: 0,
    difficultyLevels: { easy: 0, medium: 0, hard: 0 },
    answers: []
  });

  // Fetch questions from Gemini API
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const aiQuestions = await generateQuizQuestions(category, difficulty, questionCount);
        console.log("Generated questions:", aiQuestions);
        
        if (aiQuestions && aiQuestions.length > 0) {
          setQuestions(aiQuestions);
        } else {
          toast({
            title: "Error loading questions",
            description: "No questions were returned. Using fallback questions.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast({
          title: "Error loading questions",
          description: "Failed to load questions. Using fallback questions.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [category, difficulty, questionCount, toast]);

  // Timer functionality
  useEffect(() => {
    if (timeLeft > 0 && !answered && !loading) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered && !loading) {
      handleAnswer(null);
      toast({
        title: "Time's up!",
        description: "Moving to the next question.",
        variant: "destructive"
      });
    }
  }, [timeLeft, answered, loading, toast]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className='p-2 rounded-xl bgGradient2'>
        <Card>
          <CardHeader>
            <CardTitle>Loading Quiz Questions</CardTitle>
            <CardDescription>
              Please wait while we prepare your quiz...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
          <span className="loader"></span>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Ensure we have questions before proceeding
  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
            <CardDescription>
              There are no questions available for the selected category and difficulty.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={onBack}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Safety check - if currentQuestion is undefined, handle it gracefully
  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Quiz Error</CardTitle>
            <CardDescription>
              Could not load the current question. Please try again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={onBack}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleAnswer = (answer: string | null) => {
    if (!currentQuestion) return;
    
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Update results with safety check for currentQuestion
    setQuizResults(prev => {
      // Safe access to currentQuestion.difficulty with fallback
      const difficultyLevel = currentQuestion.difficulty || 'medium';
      
      const updatedResults = { 
        ...prev,
        totalQuestions: currentQuestionIndex + 1,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        incorrectAnswers: !isCorrect && answer !== null ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
        skippedQuestions: answer === null ? prev.skippedQuestions + 1 : prev.skippedQuestions,
        difficultyLevels: {
          ...prev.difficultyLevels,
          [difficultyLevel]: prev.difficultyLevels[difficultyLevel as keyof typeof prev.difficultyLevels] + 1
        },
        answers: [
          ...prev.answers,
          {
            question: currentQuestion.question,
            userAnswer: answer || "Skipped",
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: isCorrect,
            timeSpent
          }
        ]
      };
      return updatedResults;
    });

    setSelectedAnswer(answer);
    setAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(timeLimit);
      setQuestionStartTime(Date.now());
    } else {
      // Quiz completed
      const totalTime = (Date.now() - quizStartTime) / 1000;
      setQuizResults(prev => ({ ...prev, timeElapsed: totalTime }));
      onComplete(quizResults);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-16 pb-8 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Exit Quiz
      </Button>
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="font-medium">Question {currentQuestionIndex + 1}/{questions.length}</span>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(currentQuestion.difficulty)} bg-opacity-10`}>
            {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4 text-secondary" />
          <span className={`font-medium ${timeLeft < 10 ? 'text-red-500 animate-pulse-light' : ''}`}>
            {timeLeft}s
          </span>
        </div>
      </div>
      
      <Progress value={(currentQuestionIndex / questions.length) * 100} className="mb-6" />
      
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedAnswer === option 
                    ? 'border-primary border-2' 
                    : 'border-gray-200'
                } ${
                  answered && option === currentQuestion.correctAnswer 
                    ? 'bg-green-50 border-green-500' 
                    : ''
                } ${
                  answered && selectedAnswer === option && option !== currentQuestion.correctAnswer 
                    ? 'bg-red-50 border-red-500' 
                    : ''
                }`}
                onClick={() => !answered && handleAnswer(option)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 rounded-full w-6 h-6 flex items-center justify-center border border-gray-300 mr-3 mt-0.5">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div>{option}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!answered ? (
            <Button 
              variant="outline" 
              onClick={() => handleAnswer(null)}
              className="flex items-center"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Skip Question
            </Button>
          ) : (
            <div className="text-sm">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <span className="text-green-600">Correct answer!</span>
              ) : (
                <span className="text-red-600">
                  {selectedAnswer ? "Incorrect. " : ""}
                  The correct answer is: {currentQuestion.correctAnswer}
                </span>
              )}
            </div>
          )}
          
          {answered && (
            <Button onClick={nextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? (
                <>Next Question <ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                'Finish Quiz'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600">
          <div>Score: {score}/{currentQuestionIndex + (answered ? 1 : 0)}</div>
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;
