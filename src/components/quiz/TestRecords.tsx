import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { QuizAttempt, UserStats } from '../../types';
import { quizService } from '../../services/quizService';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp,
  BarChart3,
  Award,
  BookOpen,
  Zap,
  Eye
} from 'lucide-react';

export const TestRecords: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [userStats, userAttempts] = await Promise.all([
          quizService.getUserStats(),
          quizService.getUserQuizAttempts(),
        ]);
        setStats(userStats);
        setAttempts(userAttempts);
      } catch (err) {
        setError('Failed to load your test records');
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-zinc-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <BarChart3 className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  if (!stats || stats.totalAttempts === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 text-gray-600 dark:text-zinc-400">
          <Trophy className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">No Test Records Yet</p>
          <p className="text-sm">Complete your first quiz to see your statistics here!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-zinc-50">{stats.totalAttempts}</p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Total Attempts</p>
        </Card>

        <Card className="p-6 text-center">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-zinc-50">{stats.averageScore}%</p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Average Score</p>
        </Card>

        <Card className="p-6 text-center">
          <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-zinc-50">{stats.totalQuestions}</p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Questions Answered</p>
        </Card>

        <Card className="p-6 text-center">
          <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-zinc-50">{formatTime(stats.totalTime)}</p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Total Time</p>
        </Card>
      </div>

      {/* Topics Overview */}
      {stats.topics.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-50">Topics Covered</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.topics.map((topic, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-indigo-500/15 dark:text-indigo-300"
              >
                {topic}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Attempts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-50">Recent Test Records</h3>
          </div>
          <span className="text-sm text-gray-600 dark:text-zinc-400">
            Showing last {attempts.length} attempts
          </span>
        </div>

        <div className="space-y-4">
          {attempts.map((attempt) => {
            const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
            return (
              <div
                key={attempt.id}
                className="rounded-lg border border-slate-200 p-4 transition-colors hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getScoreColor(percentage)}`}>
                        {percentage}%
                      </span>
                      <span className="text-sm text-gray-600 dark:text-zinc-400">
                        ({attempt.score}/{attempt.totalQuestions})
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(attempt.difficulty)}`}
                    >
                      {attempt.difficulty}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-zinc-400">{formatDate(attempt.completedAt)}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500">{formatTime(attempt.timeTaken)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-gray-500 dark:text-zinc-500" />
                    <span className="font-medium text-gray-800 dark:text-zinc-100">{attempt.topic}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-zinc-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(attempt.timeTaken)}
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      {attempt.score}/{attempt.totalQuestions}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {attempts.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-zinc-400">
            <Eye className="w-12 h-12 mx-auto mb-2" />
            <p>No recent attempts to display</p>
          </div>
        )}
      </Card>

      {/* Performance Insights */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Award className="w-6 h-6 text-yellow-600 mr-2" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-50">Performance Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-zinc-400">Best Score</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-50">
                {Math.max(...attempts.map(a => (a.score / a.totalQuestions) * 100)).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-zinc-400">Average Time per Question</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-50">
                {stats.totalQuestions > 0 
                  ? formatTime(Math.round(stats.totalTime / stats.totalQuestions))
                  : '0:00'
                }
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-zinc-400">Most Attempted Topic</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-50">
                {stats.topics.length > 0 ? stats.topics[0] : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-zinc-400">Total Study Time</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-50">{formatTime(stats.totalTime)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 