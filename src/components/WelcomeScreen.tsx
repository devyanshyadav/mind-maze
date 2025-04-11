
import React from 'react';
import { Brain, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="animate-fade-in space-y-8 pt-16 ">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Welcome to <span className="text-primary">Mind Maze</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Challenge yourself with coding quizzes and track your knowledge growth.
        </p>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className='rounded-xl p-2  bgGradient2'>
        <Card className="card-shadow ">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Code Quiz
            </CardTitle>
            <CardDescription>
              Test your programming knowledge
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-gray-600">
              Answer questions about various programming languages and frameworks.
              Select your preferred difficulty level and number of questions.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={onStart}
            >
              Start Quiz <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
