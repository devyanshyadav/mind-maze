
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Timer, BarChart2, Award, RotateCcw, Brain, Share2, Download } from 'lucide-react';
import type { QuizResult } from './QuizComponent';

interface QuizResultsProps {
  results: QuizResult;
  onTryAgain: () => void;
  onBack: () => void;
  category?: string;
  mode: string;
}

const QuizResults: React.FC<QuizResultsProps> = ({ results, onTryAgain, onBack, category, mode }) => {
  const { toast } = useToast();

  const pieData = [
    { name: 'Correct', value: results.correctAnswers, color: '#10B981' },
    { name: 'Incorrect', value: results.incorrectAnswers, color: '#EF4444' },
    { name: 'Skipped', value: results.skippedQuestions, color: '#9CA3AF' }
  ];

  const barData = Object.entries(results.difficultyLevels).map(([level, count]) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    count,
    color: level === 'easy' ? '#10B981' : level === 'medium' ? '#F59E0B' : '#EF4444'
  }));

  const timeData = results.answers.map((answer, index) => ({
    name: `Q${index + 1}`,
    time: answer.timeSpent,
    color: answer.isCorrect ? '#10B981' : '#EF4444'
  }));

  const calculateScore = () => {
    const baseScore = results.correctAnswers * 10;
    let bonusPoints = 0;
    
    // Bonus points for time efficiency (only in timed mode)
    if (mode === 'timed') {
      const fastAnswers = results.answers.filter(a => a.isCorrect && a.timeSpent < 10).length;
      bonusPoints += fastAnswers * 5;
    }
    
    // Bonus points for difficulty (especially in challenge mode)
    if (mode === 'challenge') {
      bonusPoints += results.difficultyLevels.hard * 8;
    } else {
      bonusPoints += (results.difficultyLevels.medium * 3) + (results.difficultyLevels.hard * 5);
    }
    
    return baseScore + bonusPoints;
  };

  const saveResultsToLocalStorage = () => {
    try {
      // Get existing results or initialize empty array
      const existingResults = JSON.parse(localStorage.getItem('mindMazeResults') || '[]');
      
      // Add new result with metadata
      const newResult = {
        id: Date.now(),
        date: new Date().toISOString(),
        category,
        mode,
        score: calculateScore(),
        ...results
      };
      
      // Save updated results
      localStorage.setItem('mindMazeResults', JSON.stringify([...existingResults, newResult]));
      
      toast({
        title: "Results saved",
        description: "Your quiz results have been saved to your history."
      });
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        title: "Error saving results",
        description: "There was a problem saving your results.",
        variant: "destructive"
      });
    }
  };

  // Save results when component mounts
  React.useEffect(() => {
    saveResultsToLocalStorage();
  }, []);

  // Share results function
  const shareResults = () => {
    const shareText = `I scored ${calculateScore()} points in Mind Maze's ${mode} quiz on ${category}! I got ${results.correctAnswers} correct out of ${results.totalQuestions} questions.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Mind Maze Quiz Results',
        text: shareText,
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing:', error);
        copyToClipboard(shareText);
      });
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "You can now paste and share your results"
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: "Failed to copy",
        description: "Could not copy results to clipboard",
        variant: "destructive"
      });
    });
  };

  const downloadResults = () => {
    try {
      const resultsData = {
        date: new Date().toISOString(),
        category,
        mode,
        score: calculateScore(),
        ...results
      };
      
      const blob = new Blob([JSON.stringify(resultsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mind-maze-results-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Results downloaded",
        description: "Your quiz results have been downloaded as a JSON file."
      });
    } catch (error) {
      console.error("Error downloading results:", error);
      toast({
        title: "Error downloading results",
        description: "There was a problem downloading your results.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-16 pb-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Quiz Completed!</h2>
        <p className="text-gray-600 mt-2">
          You scored {calculateScore()} points
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Performance Summary
            </CardTitle>
            <CardDescription>
              Your performance in this quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="flex flex-col items-center">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 text-sm w-full space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Correct Answers:</span>
                  <span className="text-green-600">{results.correctAnswers} / {results.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Accuracy:</span>
                  <span>
                    {results.totalQuestions > 0
                      ? `${Math.round((results.correctAnswers / results.totalQuestions) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time Elapsed:</span>
                  <span>{Math.round(results.timeElapsed)} seconds</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-secondary" />
              Difficulty Distribution
            </CardTitle>
            <CardDescription>
              Questions by difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Questions">
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Average Time per Question:</span>
                  <span>
                    {results.answers.length > 0
                      ? `${(results.answers.reduce((acc, curr) => acc + curr.timeSpent, 0) / results.answers.length).toFixed(1)}s`
                      : '0s'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Mode:</span>
                  <span className="capitalize">{mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span className="capitalize">{category}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-accent" />
            Time Analysis
          </CardTitle>
          <CardDescription>
            Time spent on each question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="time" name="Time (seconds)">
                  {timeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Button onClick={shareResults} variant="outline" className="flex items-center justify-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Results
        </Button>
        <Button onClick={downloadResults} variant="outline" className="flex items-center justify-center gap-2">
          <Download className="h-4 w-4" />
          Download Results
        </Button>
      </div>
      
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back to Home
        </Button>
        <Button onClick={onTryAgain} className="flex items-center">
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;
