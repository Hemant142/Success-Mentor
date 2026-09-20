import mongoose from "mongoose";

const scheduleSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    required: true,
  },
  start_time: { type: String, required: true }, // e.g., "17:00"
  end_time: { type: String, required: true }, // e.g., "18:30"
  subject_id: { type: String, ref: "Subject" },
  room: { type: String, default: "Room 101" },
});

const batchSchema = new mongoose.Schema(
  {
    institute_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    name: { type: String, required: true }, // e.g., "Class 10 - Maths & Science Alpha Batch"
    class_id: { type: String, ref: "Class" },
    class_number: { type: Number, required: true }, // 1 to 10
    subject_ids: [{ type: String, ref: "Subject" }],
    teacher_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
    student_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    schedule: [scheduleSlotSchema],
    monthly_fee: { type: Number, default: 2500 },
    max_capacity: { type: Number, default: 25 },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "ARCHIVED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Batch || mongoose.model("Batch", batchSchema);
