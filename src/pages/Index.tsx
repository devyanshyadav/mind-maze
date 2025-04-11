
import React, { useState } from 'react';
import Header from '@/components/Header';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuizComponent from '@/components/QuizComponent';
import QuizResults from '@/components/QuizResults';
import QuizHistory from '@/components/QuizHistory';
import QuizConfig, { QuizConfiguration } from '@/components/QuizConfig';
import type { QuizResult } from '@/components/QuizComponent';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const [view, setView] = useState('welcome');
  const [quizConfig, setQuizConfig] = useState<QuizConfiguration | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const location = useLocation();

  React.useEffect(() => {
     if (location.pathname === '/history') {
      setView('history');
    }
  }, [location.pathname]);

  const handleStartQuiz = () => {
    setView('config');
  };

  const handleQuizConfigSubmit = (config: QuizConfiguration) => {
    setQuizConfig(config);
    setView('quiz');
  };

  const handleQuizComplete = (results: QuizResult) => {
    setQuizResults(results);
    setView('results');
  };

  const handleBackToWelcome = () => {
    setView('welcome');
  };

  const handleTryAgain = () => {
    setView('config');
  };

  return (
    <div className="min-h-screen bg-white pb-20 ">
      <Header />
      
      <main className="container mx-auto px-4">
        {view === 'welcome' && (
          <WelcomeScreen onStart={handleStartQuiz} />
        )}
        
        {view === 'config' && (
          <QuizConfig 
            onBack={handleBackToWelcome} 
            onStartQuiz={handleQuizConfigSubmit} 
          />
        )}
        
        {view === 'quiz' && quizConfig && (
          <QuizComponent 
            mode={'standard'}
            category={quizConfig.category}
            questionCount={quizConfig.questionCount}
            timeLimit={quizConfig.timeLimit}
            difficulty={quizConfig.difficulty}
            onBack={handleBackToWelcome} 
            onComplete={handleQuizComplete} 
          />
        )}
        
        {view === 'results' && quizResults && quizConfig && (
          <QuizResults 
            results={quizResults} 
            onTryAgain={handleTryAgain} 
            onBack={handleBackToWelcome} 
            category={quizConfig.category}
            mode={'standard'}
          />
        )}
        
        
        {view === 'history' && (
          <QuizHistory onBack={handleBackToWelcome} />
        )}
      </main>

      <footer className="w-full p-1.5 absolute bottom-0 *:opacity-80 bg-blue-500 border-t-2 text-white grid place-items-center text-center text-xs">
        <span>
          Made with ❤️ by{" "}
          <a
            href="https://devyanshyadav.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Devyansh Developer
          </a>
        </span>
      </footer>
    </div>
  );
};

export default Index;
