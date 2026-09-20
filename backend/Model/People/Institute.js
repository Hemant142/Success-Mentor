import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline: { type: String, default: "Smart Education for Classes 1 to 10" },
    description: { type: String },
    address: {
      street: { type: String },
      city: { type: String, default: "Delhi NCR" },
      state: { type: String, default: "Delhi" },
      pincode: { type: String },
    },
    contact_email: { type: String },
    contact_phone: { type: String },
    classes_offered: [{ type: Number }], // e.g. [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    logo_url: { type: String },
    banner_url: { type: String },
    admin_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Institute || mongoose.model("Institute", instituteSchema);
