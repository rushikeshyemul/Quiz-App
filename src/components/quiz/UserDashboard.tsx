import React, { useState, useEffect } from 'react';
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
  XCircle
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
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your quiz performance overview and history
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Questions Answered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Time</p>
                  <p className="text-2xl font-bold text-gray-900">
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
              <h2 className="text-xl font-semibold text-gray-900">Recent Performance</h2>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              {stats.recentAttempts.map((attempt, index) => (
                <div key={attempt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{attempt.topic}</p>
                      <p className="text-sm text-gray-500">{formatDate(attempt.completedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(attempt.difficulty)}`}>
                      {attempt.difficulty}
                    </span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {attempt.score}/{attempt.totalQuestions}
                      </p>
                      <p className="text-sm text-gray-500">
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
            <h2 className="text-xl font-semibold text-gray-900">Quiz History</h2>
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </div>
          
          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz attempts yet</h3>
              <p className="text-gray-500 mb-6">Start your first quiz to see your history here!</p>
              <Button variant="primary" onClick={() => window.location.href = '/dashboard'}>
                Take Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Topic</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Difficulty</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{attempt.topic}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">
                            {attempt.score}/{attempt.totalQuestions}
                          </span>
                          <span className="text-sm text-gray-500">
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
                          <Clock4 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{formatTime(attempt.timeTaken)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{formatDate(attempt.completedAt)}</span>
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