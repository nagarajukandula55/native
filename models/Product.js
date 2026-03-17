import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema({

  name: { type: String, required: true },
  description: String,
  category: String,
  brand: String,
  slug: String,
  image: String,
  alt: String,

  mrp: Number,
  price: Number,
  costPrice: Number,

  stock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 5 },

  hsn: String,
  gst: Number,

  weight: Number,
  length: Number,
  breadth: Number,
  height: Number,

  featured: { type: Boolean, default: false },

  status: { type: String, default: "ACTIVE" },

  sku: { type: String, unique: true }  // NEW FIELD

}, { timestamps: true })

/* ---------------- AUTO SKU GENERATION ---------------- */

ProductSchema.pre("save", async function(next) {
  if (!this.isNew || this.sku) return next() // Only generate for new products without SKU

  const Product = mongoose.models.Product || this.constructor

  // Extract first word after "Native"
  const nameParts = this.name.trim().split(" ")
  let keyWord = ""
  if (nameParts[0].toLowerCase() === "native" && nameParts.length > 1) {
    keyWord = nameParts[1].toUpperCase().replace(/[^A-Z0-9]/g, "") // Remove special chars
  } else {
    keyWord = nameParts[0].toUpperCase().replace(/[^A-Z0-9]/g, "")
  }

  // Count existing products with same keyword
  const count = await Product.countDocuments({ name: new RegExp(keyWord, "i") })
  const serial = String(count + 1).padStart(3, "0")

  this.sku = `NA${keyWord}${serial}`

  next()
})

export default mongoose.models.Product || mongoose.model("Product", ProductSchema)
