import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    institute_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    batch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    subject_id: { type: String, ref: "Subject", required: true },
    title: { type: String, required: true }, // e.g., "Class 10 Maths Periodic Test 1"
    exam_date: { type: Date, required: true },
    total_marks: { type: Number, required: true, default: 50 },
    passing_marks: { type: Number, required: true, default: 18 },
    syllabus_topics: [{ type: String }],
    status: {
      type: String,
      enum: ["UPCOMING", "CONDUCTED", "PUBLISHED"],
      default: "UPCOMING",
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Exam || mongoose.model("Exam", examSchema);
