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
  Home
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Quiz Complete!
        </h1>
        {autoSubmitted && (
          <p className="text-orange-600 mt-2 font-medium">
            ⏰ Quiz was automatically submitted due to time limit
          </p>
        )}
        <p className="text-gray-600 mt-2">
          Here are your results for {quiz.topic}
        </p>
        {saving && (
          <p className="text-blue-600 mt-2 text-sm">
            📊 Saving your results...
          </p>
        )}
      </div>

      {/* Score Summary */}
      <Card className="p-8 mb-8">
        <div className="text-center mb-6">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(percentage)}`}>
            {percentage}%
          </div>
          <p className="text-xl text-gray-600 mb-4">
            {score} out of {totalQuestions} correct
          </p>
          <p className="text-lg font-medium text-gray-700">
            {getScoreMessage(percentage)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-xl font-bold">{score}/{totalQuestions}</p>
          </div>
          
          <div className="text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Time Taken</p>
            <p className="text-xl font-bold">{formatTime(timeTaken)}</p>
          </div>
          
          <div className="text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-xl font-bold">{percentage}%</p>
          </div>
        </div>
      </Card>

      {/* Question Review */}
      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Question Review</h2>
        
        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg flex-1">
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
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : optionIndex === userAnswer && !isCorrect
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-gray-50 border-gray-200'
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
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
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