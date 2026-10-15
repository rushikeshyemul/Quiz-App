export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  topic: string;
  questions: Question[];
  timeLimit: number;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  topic: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  completedAt: string;
  timeTaken: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserStats {
  totalAttempts: number;
  averageScore: string;
  totalQuestions: number;
  totalTime: number;
  topics: string[];
  recentAttempts: QuizAttempt[];
}

export interface QuizConfig {
  topic: string;
  questionCount: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}