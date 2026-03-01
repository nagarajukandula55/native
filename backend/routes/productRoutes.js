
import express from 'express'
import Product from '../models/Product.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', async(req,res)=>{
  const products = await Product.find()
  res.json(products)
})

router.post('/', protect, authorize('superadmin','admin'), async(req,res)=>{
  const product = await Product.create(req.body)
  res.json(product)
})

router.put('/:id', protect, authorize('superadmin','admin'), async(req,res)=>{
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body,{new:true})
  res.json(updated)
})

router.delete('/:id', protect, authorize('superadmin'), async(req,res)=>{
  await Product.findByIdAndDelete(req.params.id)
  res.json({message:'Deleted'})
})

export default router
