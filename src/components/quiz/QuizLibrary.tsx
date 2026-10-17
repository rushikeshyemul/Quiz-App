import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { quizService } from '../../services/quizService';
import { BookOpen, Play } from 'lucide-react';

interface LibraryQuiz {
  id: string;
  topic: string;
  questionCount: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  source?: string;
  createdAt: string;
}

export const QuizLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<LibraryQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openingId, setOpeningId] = useState('');

  useEffect(() => {
    let active = true;
    quizService.listQuizzes()
      .then((items) => {
        if (!active) return;
        setQuizzes(items);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load your quizzes');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openQuiz = async (item: LibraryQuiz) => {
    setOpeningId(item.id);
    setError('');
    try {
      const quiz = await quizService.getQuiz(item.id);
      navigate('/quiz', {
        state: {
          quiz,
          config: {
            topic: quiz.topic,
            questionCount: quiz.questions.length,
            timeLimit: quiz.timeLimit || item.timeLimit || 15,
            difficulty: item.difficulty || 'medium',
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open that quiz');
      setOpeningId('');
    }
  };

  if (loading) {
    return <div className="mx-auto h-24 w-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-zinc-800" />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Saved quizzes</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">Library</h1>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {quizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="font-medium text-slate-900 dark:text-zinc-50">No saved quizzes yet</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Generate a topic quiz or upload notes to fill your library.</p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>Create a quiz</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-zinc-50">{quiz.topic}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  {quiz.questionCount} questions · {quiz.difficulty} · {quiz.source === 'document' ? 'From notes' : 'From topic'}
                </p>
              </div>
              <Button onClick={() => void openQuiz(quiz)} loading={openingId === quiz.id} disabled={openingId !== '' && openingId !== quiz.id}>
                <Play className="h-4 w-4" />
                Practice
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
