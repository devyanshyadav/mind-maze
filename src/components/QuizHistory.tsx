
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, BarChart2, Trash2, Award, Download, Filter } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface QuizHistoryProps {
  onBack: () => void;
}

interface QuizHistoryEntry {
  id: number;
  date: string;
  category: string;
  mode: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeElapsed: number;
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [historyData, setHistoryData] = useState<QuizHistoryEntry[]>([]);
  const [filteredData, setFilteredData] = useState<QuizHistoryEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [modeFilter, setModeFilter] = useState<string[]>([]);
  
  // Load history data from localStorage
  useEffect(() => {
    try {
      const storedResults = JSON.parse(localStorage.getItem('mindMazeResults') || '[]');
      
      // Convert stored results to history entries
      const historyEntries: QuizHistoryEntry[] = storedResults.map((result: any, index: number) => ({
        id: Date.now() - index,
        date: result.date || new Date().toISOString(),
        category: result.category || 'unknown',
        mode: result.mode || 'standard',
        score: result.score || (result.correctAnswers * 10),
        correctAnswers: result.correctAnswers || 0,
        totalQuestions: result.totalQuestions || 0,
        timeElapsed: result.timeElapsed || 0
      }));
      
      setHistoryData(historyEntries);
      setFilteredData(historyEntries);
      
      // Extract available categories and modes
      const categories = Array.from(new Set(historyEntries.map(entry => entry.category)));
      const modes = Array.from(new Set(historyEntries.map(entry => entry.mode)));
      
      setCategoryFilter(categories);
      setModeFilter(modes);
    } catch (error) {
      console.error("Error loading history data:", error);
      setHistoryData([]);
      setFilteredData([]);
    }
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    const filtered = historyData.filter(entry => 
      (categoryFilter.length === 0 || categoryFilter.includes(entry.category)) &&
      (modeFilter.length === 0 || modeFilter.includes(entry.mode))
    );
    setFilteredData(filtered);
  }, [categoryFilter, modeFilter, historyData]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown date';
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem('mindMazeResults');
      setHistoryData([]);
      setFilteredData([]);
      
      toast({
        title: "History cleared",
        description: "Your quiz history has been successfully cleared."
      });
    } catch (error) {
      console.error("Error clearing history:", error);
      toast({
        title: "Error clearing history",
        description: "There was a problem clearing your quiz history.",
        variant: "destructive"
      });
    }
  };

  const downloadHistory = () => {
    try {
      const dataStr = JSON.stringify(historyData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `mind-maze-history-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "History downloaded",
        description: "Your quiz history has been downloaded as a JSON file."
      });
    } catch (error) {
      console.error("Error downloading history:", error);
      toast({
        title: "Error downloading history",
        description: "There was a problem downloading your quiz history.",
        variant: "destructive"
      });
    }
  };

  // Prepare data for performance over time chart
  const chartData = filteredData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry, index) => ({
      index: index + 1,
      date: formatDate(entry.date),
      score: entry.score,
      accuracy: entry.totalQuestions > 0 
        ? Math.round((entry.correctAnswers / entry.totalQuestions) * 100) 
        : 0
    }));

  // Calculate statistics
  const totalQuizzes = filteredData.length;
  const averageScore = totalQuizzes > 0 
    ? Math.round(filteredData.reduce((sum, entry) => sum + entry.score, 0) / totalQuizzes) 
    : 0;
  const bestScore = totalQuizzes > 0 
    ? Math.max(...filteredData.map(entry => entry.score)) 
    : 0;
  const averageAccuracy = totalQuizzes > 0 
    ? Math.round(filteredData.reduce((sum, entry) => 
        sum + (entry.totalQuestions > 0 ? (entry.correctAnswers / entry.totalQuestions) * 100 : 0), 0) / totalQuizzes) 
    : 0;

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilter(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleModeFilter = (mode: string) => {
    setModeFilter(prev => 
      prev.includes(mode) 
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Quiz History</h2>
          <p className="text-gray-600">Track your progress over time</p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuCheckboxItem
                checked={categoryFilter.length === 0}
                onCheckedChange={() => setCategoryFilter([])}
              >
                All Categories
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {Array.from(new Set(historyData.map(entry => entry.category))).map(category => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={categoryFilter.includes(category)}
                  onCheckedChange={() => toggleCategoryFilter(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={modeFilter.length === 0}
                onCheckedChange={() => setModeFilter([])}
              >
                All Modes
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {Array.from(new Set(historyData.map(entry => entry.mode))).map(mode => (
                <DropdownMenuCheckboxItem
                  key={mode}
                  checked={modeFilter.includes(mode)}
                  onCheckedChange={() => toggleModeFilter(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadHistory}>
                <Download className="mr-2 h-4 w-4" />
                <span>Download History</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearHistory} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Clear History</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuizzes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Best Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Average Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAccuracy}%</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              Your score and accuracy over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index">
                      <Label value="Quiz Number" offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis yAxisId="left" orientation="left">
                      <Label value="Score" angle={-90} position="insideLeft" />
                    </YAxis>
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]}>
                      <Label value="Accuracy (%)" angle={90} position="insideRight" />
                    </YAxis>
                    <Tooltip formatter={(value, name) => [value, name === 'accuracy' ? 'Accuracy (%)' : 'Score']} />
                    <Line yAxisId="left" type="monotone" dataKey="score" stroke="#3A86FF" name="Score" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#FF006E" name="Accuracy" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No history data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-secondary" />
              Recent Quizzes
            </CardTitle>
            <CardDescription>
              Your most recent quiz attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredData.slice(0, 5).map(entry => (
                <div key={entry.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-medium capitalize">{entry.category}</div>
                      <div className="text-sm text-gray-500 capitalize">{entry.mode} mode</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.score}</div>
                      <div className="text-xs text-gray-500">{formatDate(entry.date)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-green-500" />
                      <span>
                        {entry.correctAnswers}/{entry.totalQuestions} correct
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <span>{Math.round(entry.timeElapsed)}s</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredData.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No history data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            All Quiz Attempts
          </CardTitle>
          <CardDescription>
            Complete history of your quiz attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Mode</th>
                  <th className="text-left py-3 px-4">Score</th>
                  <th className="text-left py-3 px-4">Accuracy</th>
                  <th className="text-left py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(entry => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{formatDate(entry.date)}</td>
                    <td className="py-3 px-4 capitalize">{entry.category}</td>
                    <td className="py-3 px-4 capitalize">{entry.mode}</td>
                    <td className="py-3 px-4 font-semibold">{entry.score}</td>
                    <td className="py-3 px-4">
                      {entry.totalQuestions > 0 
                        ? `${Math.round((entry.correctAnswers / entry.totalQuestions) * 100)}%` 
                        : '0%'}
                    </td>
                    <td className="py-3 px-4">{Math.round(entry.timeElapsed)}s</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No history data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizHistory;
