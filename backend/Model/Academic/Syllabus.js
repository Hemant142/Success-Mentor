import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  topic_id: { type: String },
  name: { type: String, required: true },
  is_completed: { type: Boolean, default: false },
  completed_at: { type: Date },
  completed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const chapterSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  estimated_hours: { type: Number, default: 8 },
  topics: [topicSchema],
});

const syllabusSchema = new mongoose.Schema(
  {
    subject_id: {
      type: String,
      ref: "Subject",
      required: true,
    },
    class_id: {
      type: String,
      ref: "Class",
    },
    syllabus_url: { type: String },
    chapters: [chapterSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Syllabus || mongoose.model("Syllabus", syllabusSchema);
