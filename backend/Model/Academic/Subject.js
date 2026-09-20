import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "class_10_subject_3"
    name: { type: String, required: true }, // e.g. "Mathematics"
    class_id: {
      type: String,
      ref: "Class",
      required: true,
    },
    subject_url: { type: String },
    color_code: { type: String, default: "#304b62" },
    icon_name: { type: String, default: "BookOpen" },
  },
  { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
