
import mongoose from 'mongoose'

const orderSchema = mongoose.Schema({
  customerName:String,
  customerEmail:String,
  items:Array,
  totalAmount:Number,
  status:{ type:String, default:'Pending' },
  paymentReceived:{ type:Boolean, default:false }
},{ timestamps:true })

export default mongoose.model('Order', orderSchema)
