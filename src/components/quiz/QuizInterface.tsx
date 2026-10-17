import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Quiz, QuizConfig } from '../../types';
import { quizService } from '../../services/quizService';
import { Clock, ArrowLeft } from 'lucide-react';

export const QuizInterface: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const hasSubmitted = useRef(false);
  const submissionId = useRef(crypto.randomUUID());

  const config: QuizConfig = location.state?.config;
  const existingQuiz: Quiz | null = location.state?.quiz || null;

  useEffect(() => {
    if (!config) {
      navigate('/dashboard');
      return;
    }

    let active = true;

    const loadQuiz = async () => {
      try {
        const loadedQuiz = existingQuiz
          ? existingQuiz
          : await quizService.createGeneratedQuiz(config);
        if (!active) return;
        setQuiz(loadedQuiz);
        setTimeLeft(config.timeLimit * 60);
        setAnswers(new Array(loadedQuiz.questions.length).fill(-1));
      } catch (error) {
        if (!active) return;
        console.error('Failed to load quiz:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load quiz');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadQuiz();
    return () => {
      active = false;
    };
  }, [config, existingQuiz, navigate]);

  const finishQuiz = useCallback((autoSubmitted: boolean) => {
    if (!quiz || !config || hasSubmitted.current) return;
    hasSubmitted.current = true;
    setSubmitting(true);
    setSubmitError('');

    const timeTaken = Math.max(0, config.timeLimit * 60 - timeLeft);
    void quizService.submitQuiz(quiz.id, {
      answers,
      timeTaken,
      submissionId: submissionId.current,
    }).then((result) => {
      navigate('/quiz-results', {
        state: {
          result,
          autoSubmitted,
        },
      });
    }).catch((error: unknown) => {
      hasSubmitted.current = false;
      setSubmitting(false);
      setSubmitError(error instanceof Error ? error.message : 'Could not submit this quiz');
    });
  }, [answers, config, navigate, quiz, timeLeft]);

  useEffect(() => {
    if (!quiz || submitting || submitError) return;

    const delay = timeLeft <= 0 ? 0 : 1000;
    const timer = setTimeout(() => {
      if (timeLeft <= 0) {
        finishQuiz(true);
        return;
      }
      setTimeLeft(timeLeft - 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [finishQuiz, quiz, submitError, submitting, timeLeft]);

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
    finishQuiz(false);
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
          <p className="text-gray-600 dark:text-zinc-400">Loading quiz...</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (loadError || !quiz) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <Card className="p-8">
          <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-zinc-50">Quiz could not be created</h1>
          <p className="mb-6 text-gray-600 dark:text-zinc-400">{loadError || 'No quiz was returned.'}</p>
          <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
        </Card>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Leave this quiz? This attempt will not be saved.')) {
                  navigate('/dashboard');
                }
              }}
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit to dashboard
            </button>
            <h1 className="break-words text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">{quiz.topic}</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
            timeLeft < 60 ? 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
          }`}>
            <Clock className="h-4 w-4" />
            <span className="tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>
        {submitError && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <p>{submitError}</p>
            <Button size="sm" onClick={() => finishQuiz(timeLeft <= 0)}>Retry submit</Button>
          </div>
        )}
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="mb-4 p-5 sm:p-8">
        <h2 className="mb-6 text-lg font-medium leading-7 text-slate-900 dark:text-zinc-50 sm:text-xl">
          {currentQ.question}
        </h2>
        <div className="space-y-2.5">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm ${
                selectedAnswer === index
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-white/20 dark:hover:bg-white/5'
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                selectedAnswer === index ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex flex-wrap justify-center gap-1.5">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`h-8 w-8 rounded-full text-xs font-semibold ${
                index === currentQuestion
                  ? 'bg-indigo-600 text-white'
                  : answers[index] !== -1
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30'
                  : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-white/10 dark:hover:bg-zinc-800'
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