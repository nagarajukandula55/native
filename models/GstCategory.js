import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, unique: true },
  hsn: String,
  gst: Number,
});

export default mongoose.models.GstCategory || mongoose.model("GstCategory", schema);
