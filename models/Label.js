import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema({
  userId: String,
  name: String,
  front: Array,
  back: Array,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Label || mongoose.model("Label", LabelSchema);
