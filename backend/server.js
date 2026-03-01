
import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

dotenv.config()
const app = express()

app.use(helmet())
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }))

mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log('MongoDB Connected'))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

app.get('/', (req,res)=>res.send('Native Organic API Running'))

app.listen(process.env.PORT || 5000, ()=>console.log('Server Started'))
