import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    marks_obtained: { type: Number, default: 0 },
    is_absent: { type: Boolean, default: false },
    percentage: { type: Number },
    grade: { type: String },
    teacher_remarks: { type: String },
    marked_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto compute percentage and grade before saving
resultSchema.pre("save", async function (next) {
  if (this.isModified("marks_obtained") && !this.is_absent) {
    const Exam = mongoose.model("Exam");
    const exam = await Exam.findById(this.exam_id);
    if (exam && exam.total_marks > 0) {
      this.percentage = Math.round((this.marks_obtained / exam.total_marks) * 100);
      if (this.percentage >= 90) this.grade = "A+";
      else if (this.percentage >= 80) this.grade = "A";
      else if (this.percentage >= 70) this.grade = "B+";
      else if (this.percentage >= 60) this.grade = "B";
      else if (this.percentage >= 50) this.grade = "C";
      else if (this.percentage >= 35) this.grade = "D";
      else this.grade = "F";
    }
  }
  next();
});

export default mongoose.models.Result || mongoose.model("Result", resultSchema);
