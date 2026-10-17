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
  correctAnswer?: number;
  explanation?: string;
}

export interface AnswerReview {
  id: string;
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  explanation: string;
  sourceQuote?: string;
  isCorrect: boolean;
}

export interface Certificate {
  id: string;
  attemptId: string;
  quizId: string;
  recipientName: string;
  topic: string;
  score: number;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeTaken?: number;
  certificateNumber: string;
  issuedAt: string;
}

export interface SubmissionResult {
  id: string;
  quizId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completedAt: string;
  percentage: number;
  answers: number[];
  review: AnswerReview[];
  duplicate?: boolean;
  certificate?: Certificate | null;
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

export interface TopicAccuracy {
  topic: string;
  correct: number;
  total: number;
  attempts: number;
  accuracy: number;
  evidence: 'limited' | 'sufficient';
  needsReview: boolean;
}

export interface UserStats {
  totalAttempts: number;
  averageScore: number;
  totalQuestions: number;
  totalTime: number;
  topics: string[];
  recentAttempts: QuizAttempt[];
  topicAccuracy?: TopicAccuracy[];
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