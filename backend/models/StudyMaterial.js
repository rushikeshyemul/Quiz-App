import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    page: Number,
    text: String,
  },
  { _id: false }
);

const studyMaterialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  filename: { type: String, required: true, maxlength: 180 },
  kind: { type: String, enum: ["pdf", "txt"], required: true },
  pageCount: { type: Number, default: 1 },
  charCount: { type: Number, required: true },
  text: { type: String, required: true },
  pages: [pageSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("StudyMaterial", studyMaterialSchema);
