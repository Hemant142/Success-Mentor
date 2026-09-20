import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "class_1", "class_10"
    name: { type: String, required: true }, // e.g. "Class 10"
    class_number: { type: Number }, // 1 to 10
    description: { type: String },
    class_url: { type: String },
    monthly_base_fee: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

export default mongoose.models.Class || mongoose.model("Class", classSchema);
