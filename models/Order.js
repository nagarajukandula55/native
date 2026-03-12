import mongoose from "mongoose"

const OrderSchema = new mongoose.Schema({

customerName: String,
phone: String,
address: String,
city: String,
pincode: String,

items: [
{
productId: String,
name: String,
price: Number,
quantity: Number
}
],

total: Number,

paymentMethod: String,

status:{
type:String,
default:"NEW"
},

createdAt:{
type:Date,
default:Date.now
}

})

export default mongoose.models.Order || mongoose.model("Order",OrderSchema)
