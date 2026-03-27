import mongoose from "mongoose";

const BrandKitSchema = new mongoose.Schema({
  userId: String,
  brandName: String,
  logo: String,
  primaryColor: String,
  secondaryColor: String,
  font: String,
});

export default mongoose.models.BrandKit || mongoose.model("BrandKit", BrandKitSchema);
