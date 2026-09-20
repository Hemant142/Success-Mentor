import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    institute_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    photo_url: { type: String },
    qualifications: [{ type: String }], // e.g. ["M.Sc Mathematics", "B.Ed"]
    specializations: [{ type: String }], // e.g. ["Class 9-10 Maths", "Science"]
    assigned_classes: [{ type: Number }], // e.g. [1, 2, 3, 4, 5]
    primary_subject: { type: String }, // e.g. "Primary EVS & Science"
    experience_years: { type: Number, default: 5 },
    bio: { type: String },
    assigned_batches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
    rating: { type: Number, default: 4.8 },
  },
  { timestamps: true }
);

export default mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
