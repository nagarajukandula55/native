import connectDB from "@/lib/db"
import Product from "@/models/Product"

export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()

    if (!body.name || !body.price) {
      return new Response(JSON.stringify({ success: false, error: "Name & Price required" }), { status: 400 })
    }

    // ------------------- Generate SKU -------------------
    let firstWord = body.name.replace(/^Native\s+/i, "").split(" ")[0].toUpperCase()
    let regex = new RegExp(`^NA${firstWord}(\\d+)$`)
    
    // Find all existing products with same prefix
    const existingProducts = await Product.find({ sku: { $regex: regex } }).sort({ createdAt: -1 })
    let serial = 1
    if (existingProducts.length) {
      const lastSku = existingProducts[0].sku
      const lastNum = parseInt(lastSku.match(/\d+$/)[0])
      serial = lastNum + 1
    }
    const skuNumber = serial.toString().padStart(3, "0")
    const sku = `NA${firstWord}${skuNumber}`
    // -------------------------------------------------------

    const product = new Product({
      ...body,
      sku,
      slug: body.name.toLowerCase().replace(/\s+/g, "-")
    })

    await product.save()

    return new Response(JSON.stringify({ success: true, product }), { status: 200 })

  } catch (err) {
    console.log(err)
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 })
  }
}
