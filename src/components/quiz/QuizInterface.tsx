import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Quiz, QuizConfig } from '../../types';
import { quizService } from '../../services/quizService';
import { Clock } from 'lucide-react';

export const QuizInterface: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const config: QuizConfig = location.state?.config;
  const existingQuiz: Quiz | null = location.state?.quiz || null;

  useEffect(() => {
    if (!config) {
      navigate('/dashboard');
      return;
    }

    const loadQuiz = async () => {
      try {
        if (existingQuiz) {
          // Quiz already provided (e.g., from PDF upload)
          setQuiz(existingQuiz);
          setTimeLeft(config.timeLimit * 60);
          setAnswers(new Array(existingQuiz.questions.length).fill(-1));
        } else {
          // Generate new quiz
          const quizData = await quizService.generateQuiz(config);
          
          // Save quiz to backend to get proper MongoDB _id
          const savedQuiz = await quizService.saveQuizToBackend({
            topic: quizData.topic,
            questions: quizData.questions,
            timeLimit: quizData.timeLimit,
          });
          
          setQuiz(savedQuiz);
          setTimeLeft(config.timeLimit * 60);
          setAnswers(new Array(savedQuiz.questions.length).fill(-1));
        }
      } catch (error) {
        console.error('Failed to load quiz:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [config, existingQuiz, navigate]);

  const handleAutoSubmit = useCallback(() => {
    if (!quiz || submitting || !config) return;

    setSubmitting(true);

    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const timeTaken = config.timeLimit * 60 - timeLeft;

    navigate('/quiz-results', {
      state: {
        quiz,
        answers,
        score,
        totalQuestions: quiz.questions.length,
        timeTaken,
        autoSubmitted: true,
        difficulty: config.difficulty,
      },
    });
  }, [answers, config, navigate, quiz, submitting, timeLeft]);

  useEffect(() => {
    if (!quiz || submitting) return;

    const delay = timeLeft <= 0 ? 0 : 1000;
    const timer = setTimeout(() => {
      if (timeLeft <= 0) {
        handleAutoSubmit();
        return;
      }
      setTimeLeft(timeLeft - 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [handleAutoSubmit, quiz, submitting, timeLeft]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleManualSubmit = () => {
    if (!quiz) return;
    
    setSubmitting(true);
    
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const timeTaken = (config.timeLimit * 60) - timeLeft;

    navigate('/quiz-results', {
      state: {
        quiz,
        answers,
        score,
        totalQuestions: quiz.questions.length,
        timeTaken,
        autoSubmitted: false,
        difficulty: config.difficulty,
      },
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = quiz ? ((currentQuestion + 1) / quiz.questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (loadError || !quiz) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Quiz could not be created</h1>
          <p className="text-gray-600 mb-6">{loadError || 'No quiz was returned.'}</p>
          <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
        </Card>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.topic}</h1>
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center px-3 py-1 rounded-full ${
              timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-linear-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="p-8 mb-6">
        <h2 className="text-xl font-semibold mb-6 leading-relaxed">
          {currentQ.question}
        </h2>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers[index] !== -1
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <Button
            onClick={handleManualSubmit}
            loading={submitting}
            disabled={selectedAnswer === -1}
            size="lg"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === -1}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};