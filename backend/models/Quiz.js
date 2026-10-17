import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    id: String,
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    explanation: String,
    sourceQuote: String,
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  topic: { type: String, required: true },
  questions: { type: [questionSchema], required: true },
  timeLimit: Number,
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  source: { type: String, enum: ["topic", "document"], default: "topic" },
  material: { type: mongoose.Schema.Types.ObjectId, ref: "StudyMaterial" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Quiz", quizSchema);
