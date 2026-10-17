import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TestRecords } from './TestRecords';
import { quizService } from '../../services/quizService';
import { 
  BookOpen, 
  Clock, 
  Upload, 
  TrendingUp, 
  Target,
  Play,
  Settings,
  Plus,
  BarChart3,
  Home
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'records'>('create');
  const navigate = useNavigate();

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const topicList = await quizService.getQuizTopics();
        setTopics(topicList);
      } catch (error) {
        console.error('Failed to load topics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  const handleTopicSelect = () => {
    const topic = showCustomInput ? customTopic : selectedTopic;
    if (topic.trim()) {
      navigate('/quiz-setup', { state: { topic: topic.trim() } });
    }
  };

  const handlePDFUpload = () => {
    navigate('/pdf-upload');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fieldClass = "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100";

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#1f6b4a] dark:text-[#7dcea0]">QuizMaster</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Create a quiz
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Pick a topic, set the difficulty, and Gemini writes a fresh set of questions.
          </p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
              activeTab === 'create'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <Home className="mr-2 h-4 w-4" />
            Create
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
              activeTab === 'records'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Records
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <>
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="flex items-start gap-3 p-4" hover>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">Track progress</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Scores and history stay with your account.</p>
              </div>
            </Card>
            <Card className="flex items-start gap-3 p-4" hover>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                <Target className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">Set the challenge</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Choose length, time, and difficulty.</p>
              </div>
            </Card>
            <Card className="flex items-start gap-3 p-4" hover>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">Timed practice</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">The quiz submits itself when time runs out.</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <div className="mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">Choose a topic</h2>
              </div>
              
              <div className="space-y-4">
                {/* Topic Dropdown */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300">
                    Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => {
                      setSelectedTopic(e.target.value);
                      setShowCustomInput(false);
                      setCustomTopic('');
                    }}
                    className={fieldClass}
                  >
                    <option value="">-- Select a Topic --</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Topic Option */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCustomInput(!showCustomInput);
                      setSelectedTopic('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {showCustomInput ? 'Use the topic list' : 'Use a custom topic'}
                  </Button>
                </div>

                {/* Custom Topic Input */}
                {showCustomInput && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Custom topic
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Machine Learning, Blockchain, etc."
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                )}

                {/* Start Quiz Button */}
                <Button
                  onClick={handleTopicSelect}
                  disabled={!selectedTopic && !customTopic.trim()}
                  className="w-full"
                  size="lg"
                >
                  <Play className="h-4 w-4" />
                  Continue
                </Button>
              </div>
            </Card>

            <Card className="flex flex-col p-6">
              <div className="mb-6 flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">Upload a PDF</h2>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-white/15 dark:bg-zinc-950">
                <Upload className="mb-3 h-8 w-8 text-slate-400 dark:text-zinc-500" />
                <p className="max-w-xs text-sm text-slate-600 dark:text-zinc-400">
                  Extract text from a PDF or notes file, then generate questions from that material.
                </p>
                <Button onClick={handlePDFUpload} variant="outline" className="mt-4">
                  Choose PDF
                </Button>
                <p className="mt-3 text-xs text-slate-400 dark:text-zinc-500">PDF files up to 10MB</p>
              </div>
              <div className="mt-6 flex items-start gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-white/10 dark:text-zinc-400">
                <Settings className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Choose a topic, set the quiz, then review your score and explanations.</p>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <TestRecords />
      )}
    </div>
  );
};