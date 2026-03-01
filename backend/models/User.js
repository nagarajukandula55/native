
import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['superadmin','admin','staff'], default: 'staff' }
},{ timestamps:true })

export default mongoose.model('User', userSchema)
