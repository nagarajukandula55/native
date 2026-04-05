import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, unique: true },
});

export default mongoose.models.Category || mongoose.model("Category", schema);
