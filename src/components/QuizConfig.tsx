
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuizConfigProps {
  onBack: () => void;
  onStartQuiz: (config: QuizConfiguration) => void;
}

export interface QuizConfiguration {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit: number;
}

const programmingCategories = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'react', name: 'React.js' },
  { id: 'nextjs', name: 'Next.js' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'php', name: 'PHP' },
  { id: 'java', name: 'Java' },
  { id: 'csharp', name: 'C#' },
  { id: 'golang', name: 'Go' },
  { id: 'ruby', name: 'Ruby' },
];

const QuizConfig: React.FC<QuizConfigProps> = ({ onBack, onStartQuiz }) => {
  const [category, setCategory] = useState('javascript');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartQuiz({
      category,
      difficulty,
      questionCount,
      timeLimit
    });
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto px-4 pt-16 pb-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className='p-2 rounded-xl bgGradient2'>
      <Card>
        <CardHeader>
          <CardTitle>Quiz Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Programming Category</Label>
              <Select 
                value={category} 
                onValueChange={value => setCategory(value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {programmingCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <RadioGroup 
                value={difficulty} 
                onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'hard')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy">Easy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard">Hard</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="questionCount">Number of Questions</Label>
              <Input
                id="questionCount"
                type="number"
                min={1}
                max={20}
                value={questionCount}
                onChange={e => setQuestionCount(parseInt(e.target.value) || 5)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit per Question (seconds)</Label>
              <Input
                id="timeLimit"
                type="number"
                min={10}
                max={120}
                value={timeLimit}
                onChange={e => setTimeLimit(parseInt(e.target.value) || 30)}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default QuizConfig;
