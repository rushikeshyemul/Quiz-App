import express from 'express';
import jwt from 'jsonwebtoken';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';

const router = express.Router();

// Middleware to verify JWT
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Save a quiz
router.post('/', auth, async (req, res) => {
  try {
    const { topic, questions, timeLimit } = req.body;
    const quiz = await Quiz.create({
      user: req.userId,
      topic,
      questions,
      timeLimit,
    });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save quiz', error: err.message });
  }
});

// Get all quizzes for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.userId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quizzes', error: err.message });
  }
});

// Save quiz attempt
router.post('/attempt', auth, async (req, res) => {
  try {
    const { quizId, topic, answers, score, totalQuestions, timeTaken, difficulty } = req.body;
    const quizAttempt = await QuizAttempt.create({
      user: req.userId,
      quiz: quizId,
      topic,
      answers,
      score,
      totalQuestions,
      timeTaken,
      difficulty,
    });
    res.json(quizAttempt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save quiz attempt', error: err.message });
  }
});

// Get user's quiz attempts (test records)
router.get('/attempts', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.userId })
      .sort({ completedAt: -1 })
      .populate('quiz', 'topic questions');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz attempts', error: err.message });
  }
});

// Get user's quiz statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.userId });
    
    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0 
        ? (attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length).toFixed(2)
        : 0,
      totalQuestions: attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0),
      totalTime: attempts.reduce((sum, attempt) => sum + attempt.timeTaken, 0),
      topics: [...new Set(attempts.map(attempt => attempt.topic))],
      recentAttempts: attempts.slice(0, 5), // Last 5 attempts
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz statistics', error: err.message });
  }
});

export default router; 