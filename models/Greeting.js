import mongoose from "mongoose";

const GreetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  imageUrl: { type: String },
  platform: { type: String, enum: ["Instagram","Facebook","Twitter","LinkedIn"], default: "Instagram" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Greeting || mongoose.model("Greeting", GreetingSchema);
