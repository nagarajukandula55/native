
import mongoose from 'mongoose'

const productSchema = mongoose.Schema({
  name:String,
  description:String,
  price:Number,
  image:String,
  stock:Number
},{ timestamps:true })

export default mongoose.model('Product', productSchema)
