import mongoose from "mongoose";

const GSTOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hsn: { type: String, required: true },
  gst: { type: Number, required: true },
});

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    type: { type: String, enum: ["website", "gst"], required: true },
    gstOptions: [GSTOptionSchema], // Only for GST categories
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
