import mongoose from "mongoose"

const adminSchema = new mongoose.Schema({

  name:String,

  email:{
    type:String,
    unique:true
  },

  password:String,

  role:{
    type:String,
    default:"admin"
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

})

export default mongoose.models.Admin ||
mongoose.model("Admin", adminSchema)
