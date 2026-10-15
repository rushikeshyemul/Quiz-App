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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Welcome to QuizMaster
        </h1>
        <p className="text-xl text-gray-600">
          Test your knowledge and track your progress
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Home className="w-4 h-4 mr-2" />
            Create Quiz
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'records'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Test Records
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center" hover>
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your quiz performance and improvement over time</p>
            </Card>

            <Card className="p-6 text-center" hover>
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Customizable</h3>
              <p className="text-gray-600">Choose topics, difficulty, and question count</p>
            </Card>

            <Card className="p-6 text-center" hover>
              <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Timed Challenges</h3>
              <p className="text-gray-600">Test your knowledge under time pressure</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold">Choose a Topic</h2>
              </div>
              
              <div className="space-y-4">
                {/* Topic Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select from available topics:
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => {
                      setSelectedTopic(e.target.value);
                      setShowCustomInput(false);
                      setCustomTopic('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="text-center">
                  <p className="text-gray-600 mb-2">or</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCustomInput(!showCustomInput);
                      setSelectedTopic('');
                    }}
                    className="flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Enter Custom Topic
                  </Button>
                </div>

                {/* Custom Topic Input */}
                {showCustomInput && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your custom topic:
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
                  <Play className="w-5 h-5 mr-2" />
                  Start Quiz Setup
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-6">
                <Upload className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-2xl font-bold">Upload PDF Quiz</h2>
              </div>
              
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Upload a PDF file containing quiz questions and answers
                  </p>
                  <Button onClick={handlePDFUpload} className="mb-2">
                    Upload PDF
                  </Button>
                  <p className="text-sm text-gray-500">
                    Supports PDF files up to 10MB
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center mb-4">
                  <Settings className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="font-semibold">Quick Start</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Select a topic or upload a PDF</p>
                  <p>• Configure quiz settings</p>
                  <p>• Take the quiz and view results</p>
                </div>
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