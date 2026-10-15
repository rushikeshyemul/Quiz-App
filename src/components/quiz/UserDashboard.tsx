import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { API_URL } from '../../config';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp,
  BookOpen,
  BarChart3,
  Clock4,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';

interface QuizAttempt {
  _id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  completedAt: string;
  difficulty: string;
}

interface UserStats {
  totalAttempts: number;
  averageScore: number;
  totalQuestions: number;
  totalTime: number;
  topics: string[];
  recentAttempts: QuizAttempt[];
}

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const statsResponse = await fetch(`${API_URL}/quiz/stats`, { headers });
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        setStats(await statsResponse.json());

        const attemptsResponse = await fetch(`${API_URL}/quiz/attempts`, { headers });
        if (!attemptsResponse.ok) {
          throw new Error('Failed to fetch attempts');
        }
        setAttempts(await attemptsResponse.json());
      } catch (error) {
        console.error('Error fetching user data:', error);
        setStats({
          totalAttempts: 0,
          averageScore: 0,
          totalQuestions: 0,
          totalTime: 0,
          topics: [],
          recentAttempts: [],
        });
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchUserData();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScorePercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-zinc-50">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-zinc-400">
              Here's your quiz performance overview and history
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard')}>
            <Plus className="h-4 w-4" />
            Create a quiz
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-indigo-500/15 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">{stats.totalAttempts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-500/15 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">{stats.averageScore}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-500/15 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Questions Answered</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">{stats.totalQuestions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 dark:bg-orange-500/15 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Total Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
                    {formatTime(stats.totalTime)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Performance Chart */}
        {stats && stats.recentAttempts.length > 0 && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">Recent Performance</h2>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              {stats.recentAttempts.map((attempt, index) => (
                <div key={attempt._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-950 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-indigo-500/15 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-zinc-50">{attempt.topic}</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{formatDate(attempt.completedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(attempt.difficulty)}`}>
                      {attempt.difficulty}
                    </span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-zinc-50">
                        {attempt.score}/{attempt.totalQuestions}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {getScorePercentage(attempt.score, attempt.totalQuestions)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quiz History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">Quiz History</h2>
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
          </div>
          
          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-50 mb-2">No quiz attempts yet</h3>
              <p className="text-gray-500 dark:text-zinc-400 mb-6">Start your first quiz to see your history here!</p>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Take Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Topic</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Difficulty</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt._id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-zinc-50">{attempt.topic}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-zinc-50">
                            {attempt.score}/{attempt.totalQuestions}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-zinc-400">
                            ({getScorePercentage(attempt.score, attempt.totalQuestions)}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(attempt.difficulty)}`}>
                          {attempt.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <Clock4 className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                          <span className="text-gray-700 dark:text-zinc-300">{formatTime(attempt.timeTaken)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600 dark:text-zinc-400">{formatDate(attempt.completedAt)}</span>
                      </td>
                      <td className="py-4 px-4">
                        {getScorePercentage(attempt.score, attempt.totalQuestions) >= 70 ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Passed</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Failed</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}; 