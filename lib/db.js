import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("❌ Please define the MONGODB_URI in .env")
}

/* =========================
   🌍 GLOBAL CACHE
========================= */

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  }
}

/* =========================
   🔗 CONNECT FUNCTION
========================= */

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    console.log("🟡 Connecting to MongoDB...")

    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10, // connection pool
      serverSelectionTimeoutMS: 5000, // fail fast
    })
  }

  try {
    cached.conn = await cached.promise
    console.log("🟢 MongoDB Connected")
  } catch (error) {
    cached.promise = null
    console.error("🔴 MongoDB Connection Error:", error)
    throw error
  }

  return cached.conn
}

export default connectDB
