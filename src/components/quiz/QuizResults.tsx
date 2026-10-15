import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Quiz } from '../../types';
import { quizService } from '../../services/quizService';
import { 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Home,
  BarChart3
} from 'lucide-react';

const savedAttemptKeys = new Set<string>();

export const QuizResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const {
    quiz,
    answers,
    score,
    totalQuestions,
    timeTaken,
    autoSubmitted,
    difficulty = 'medium',
  } = location.state as {
    quiz: Quiz;
    answers: number[];
    score: number;
    totalQuestions: number;
    timeTaken: number;
    autoSubmitted?: boolean;
    difficulty?: 'easy' | 'medium' | 'hard';
  };

  useEffect(() => {
    const attemptKey = [
      quiz.id,
      score,
      timeTaken,
      difficulty,
      answers.join(","),
    ].join("|");
    if (savedAttemptKeys.has(attemptKey)) return;
    savedAttemptKeys.add(attemptKey);

    const saveQuizAttempt = async () => {
      try {
        setSaving(true);
        await quizService.saveQuizAttempt({
          quizId: quiz.id,
          topic: quiz.topic,
          answers,
          score,
          totalQuestions,
          timeTaken,
          difficulty,
        });
      } catch (error) {
        savedAttemptKeys.delete(attemptKey);
        console.error('Failed to save quiz attempt:', error);
      } finally {
        setSaving(false);
      }
    };

    void saveQuizAttempt();
  }, [quiz.id, quiz.topic, answers, score, totalQuestions, timeTaken, difficulty]);

  const percentage = Math.round((score / totalQuestions) * 100);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Well done!';
    if (percentage >= 70) return 'Good work! Keep it up!';
    if (percentage >= 60) return 'Not bad! Room for improvement.';
    return 'Keep practicing! You can do better!';
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{quiz.topic}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">Quiz complete</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">{getScoreMessage(percentage)}</p>
        {autoSubmitted && (
          <p className="mt-2 text-sm font-medium text-amber-700">
            Submitted automatically when the timer ended.
          </p>
        )}
        {saving && (
          <p className="mt-2 text-sm text-indigo-600">Saving your result...</p>
        )}
      </div>

      <Card className="mb-6 p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className={`text-6xl font-semibold tracking-tight ${getScoreColor(percentage)}`}>
            {percentage}%
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            {score} of {totalQuestions} correct
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-zinc-400">Score</p>
            <p className="text-xl font-bold text-slate-900 dark:text-zinc-50">{score}/{totalQuestions}</p>
          </div>
          
          <div className="text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-zinc-400">Time Taken</p>
            <p className="text-xl font-bold text-slate-900 dark:text-zinc-50">{formatTime(timeTaken)}</p>
          </div>
          
          <div className="text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-zinc-400">Accuracy</p>
            <p className="text-xl font-bold text-slate-900 dark:text-zinc-50">{percentage}%</p>
          </div>
        </div>
      </Card>

      {/* Question Review */}
      <Card className="p-8 mb-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-zinc-50">Question Review</h2>
        
        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className="rounded-lg border border-slate-200 p-6 dark:border-white/10">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="flex-1 text-lg font-semibold text-slate-900 dark:text-zinc-50">
                    {index + 1}. {question.question}
                  </h3>
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 ml-4" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 ml-4" />
                  )}
                </div>
                
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-lg border ${
                        optionIndex === question.correctAnswer
                          ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300'
                          : optionIndex === userAnswer && !isCorrect
                          ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
                          : 'border-gray-200 bg-gray-50 text-slate-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <span>{option}</span>
                        {optionIndex === question.correctAnswer && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                        {optionIndex === userAnswer && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {question.explanation && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
                    <p className="text-sm text-blue-800 dark:text-indigo-200">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate('/user-dashboard')}
          className="flex items-center"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          View history
        </Button>

        <Button
          onClick={() => navigate('/quiz-setup', { state: { topic: quiz.topic } })}
          className="flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake Quiz
        </Button>
      </div>
    </div>
  );
};