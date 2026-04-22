import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: String,
    permissions: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model("Role", RoleSchema);
