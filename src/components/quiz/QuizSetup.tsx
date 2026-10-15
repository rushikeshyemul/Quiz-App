import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QuizConfig } from '../../types';
import { Play, Clock, Hash, Target, BookOpen, ArrowLeft } from 'lucide-react';

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
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Setup</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Configure this quiz
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          These settings are sent to Gemini when the questions are written.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <BookOpen className="h-4 w-4" />
              Topic
            </label>
            <Input
              type="text"
              value={config.topic}
              onChange={(e) => handleConfigChange('topic', e.target.value)}
              required
              className="bg-slate-50 dark:bg-zinc-950"
              disabled
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <Hash className="h-4 w-4" />
              Number of questions
            </label>
            <select
              value={config.questionCount}
              onChange={(e) => handleConfigChange('questionCount', parseInt(e.target.value))}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <Clock className="h-4 w-4" />
              Time limit
            </label>
            <select
              value={config.timeLimit}
              onChange={(e) => handleConfigChange('timeLimit', parseInt(e.target.value))}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <Target className="h-4 w-4" />
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleConfigChange('difficulty', level)}
                  className={`h-11 rounded-xl border text-sm font-medium ${
                    config.difficulty === level
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-white/5'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-zinc-950 dark:text-zinc-400">
            <p className="font-medium text-slate-900 dark:text-zinc-50">{config.topic}</p>
            <p className="mt-1">
              {config.questionCount} questions · {config.timeLimit} minutes · {config.difficulty}
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              type="submit"
              className="flex-1"
              size="lg"
            >
              <Play className="h-4 w-4" />
              Start quiz
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};