
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

router.post('/login', async (req,res)=>{
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if(!user) return res.status(404).json({message:'User not found'})
  const match = await bcrypt.compare(password, user.password)
  if(!match) return res.status(400).json({message:'Invalid credentials'})
  const token = jwt.sign({ id:user._id, role:user.role }, process.env.JWT_SECRET)
  res.json({ token })
})

export default router
