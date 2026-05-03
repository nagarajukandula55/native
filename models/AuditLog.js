import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema({
  orderId: String,
  action: String,
  from: String,
  to: String,
  performedBy: String,
}, { timestamps: true });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", AuditSchema);
