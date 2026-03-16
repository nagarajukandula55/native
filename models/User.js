import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
}, {
  timestamps: true,
  collection: "users"
})

const User = mongoose.models.User || mongoose.model("User", UserSchema)
export default User
