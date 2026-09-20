import mongoose from "mongoose";

const studentAttendanceRecordSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  status: {
    type: String,
    enum: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
    default: "PRESENT",
  },
  check_in_time: { type: String }, // e.g., "16:58"
  check_out_time: { type: String }, // e.g., "18:32"
  remarks: { type: String },
});

const attendanceSchema = new mongoose.Schema(
  {
    institute_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    batch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    date: { type: Date, required: true }, // Normalized to YYYY-MM-DD
    subject_id: { type: String, ref: "Subject" },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    topic_covered: { type: String },
    records: [studentAttendanceRecordSchema],
    marked_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Compound index to ensure 1 attendance record per batch per date
attendanceSchema.index({ batch_id: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
