import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", required: true, unique: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  recipientName: { type: String, required: true },
  topic: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  timeTaken: { type: Number, default: 0 },
  certificateNumber: { type: String, required: true, unique: true },
  issuedAt: { type: Date, required: true },
});

export default mongoose.model("Certificate", certificateSchema);
