
import express from 'express'
import Order from '../models/Order.js'

const router = express.Router()

router.post('/', async(req,res)=>{
  const order = await Order.create(req.body)
  res.json(order)
})

router.get('/', async(req,res)=>{
  const orders = await Order.find()
  res.json(orders)
})

router.put('/:id/payment', async(req,res)=>{
  const order = await Order.findById(req.params.id)
  order.paymentReceived = true
  order.status = 'Paid'
  await order.save()
  res.json(order)
})

export default router
