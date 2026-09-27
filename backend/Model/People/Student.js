import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    institute_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Parent" },
    name: { type: String, required: true },
    roll_no: { type: String },
    class_id: { type: String, ref: "Class" },
    class_level: { type: Number, required: true }, // 1 to 10
    school_name: { type: String },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], default: "MALE" },
    dob: { type: Date },
    avatar_url: { type: String },
    enrolled_batches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "GRADUATED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", studentSchema);
