import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number,
  explanation: String,
});

const quizSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  questions: [questionSchema],
  timeLimit: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Quiz', quizSchema); 