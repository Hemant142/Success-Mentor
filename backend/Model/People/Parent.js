import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    institute_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    alternate_phone: { type: String },
    email: { type: String },
    occupation: { type: String },
    address: { type: String },
    student_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Multi-child sibling management
  },
  { timestamps: true }
);

export default mongoose.models.Parent || mongoose.model("Parent", parentSchema);
