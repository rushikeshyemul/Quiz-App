import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QuizConfig } from '../../types';
import { Settings, Play, Clock, Hash, Target, BookOpen } from 'lucide-react';

export const QuizSetup: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [config, setConfig] = useState<QuizConfig>({
    topic: location.state?.topic || 'General Knowledge',
    questionCount: 10,
    timeLimit: 15,
    difficulty: 'medium',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/quiz', { state: { config } });
  };

  const handleConfigChange = <K extends keyof QuizConfig>(
    field: K,
    value: QuizConfig[K]
  ) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Quiz Setup
        </h1>
        <p className="text-gray-600 mt-2">
          Configure your quiz settings
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Topic
            </label>
            <Input
              type="text"
              value={config.topic}
              onChange={(e) => handleConfigChange('topic', e.target.value)}
              required
              className="bg-gray-50"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Number of Questions
            </label>
            <select
              value={config.questionCount}
              onChange={(e) => handleConfigChange('questionCount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Time Limit (minutes)
            </label>
            <select
              value={config.timeLimit}
              onChange={(e) => handleConfigChange('timeLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleConfigChange('difficulty', level)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    config.difficulty === level
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Quiz Summary</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Topic: {config.topic}</p>
              <p>• Questions: {config.questionCount}</p>
              <p>• Time: {config.timeLimit} minutes</p>
              <p>• Difficulty: {config.difficulty}</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Back to Dashboard
            </Button>
            <Button
              type="submit"
              className="flex-1"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};