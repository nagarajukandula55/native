import mongoose from "mongoose"

const OrderSchema = new mongoose.Schema({

customer:{
name:String,
phone:String,
address:String,
pincode:String
},

items:[{
name:String,
price:Number,
quantity:Number
}],

status:{
type:String,
default:"NEW"
},

createdAt:{
type:Date,
default:Date.now
}

})

export default mongoose.models.Order ||
mongoose.model("Order", OrderSchema)
