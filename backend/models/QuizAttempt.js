import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  topic: { type: String, required: true },
  answers: [Number],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  submissionId: { type: String },
});

quizAttemptSchema.index({ user: 1, submissionId: 1 }, { unique: true, sparse: true });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
