import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: { type: String, enum: ["Instagram","Facebook","Twitter","LinkedIn"], required: true },
  content: String,
  imageUrl: String,
  hashtags: [String],
  templateUsed: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
