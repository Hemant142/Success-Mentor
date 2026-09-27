import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    institute_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    parent_name: { type: String, required: true },
    parent_phone: { type: String, required: true },
    parent_email: { type: String },
    parent_address: { type: String },
    student_name: { type: String, required: true },
    student_class: { type: Number, required: true }, // 1 to 10
    school_name: { type: String },
    subjects_interested: [{ type: String }], // e.g., ["Mathematics", "Science"]
    preferred_batch_timing: {
      type: String,
      enum: ["MORNING", "EVENING", "WEEKEND", "ANY"],
      default: "EVENING",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    assigned_batch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
    created_student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    created_parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Parent" },
    rejection_reason: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
