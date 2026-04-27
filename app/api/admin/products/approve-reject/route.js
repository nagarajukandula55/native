import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req) {
  await connectDB();

  const { productKey, action } = await req.json();

  const product = await Product.findOne({ productKey });

  if (!product) {
    return Response.json({ success: false }, { status: 404 });
  }

  if (action === "approve") {
    product.status = "approved";
  }

  if (action === "reject") {
    product.status = "rejected";
  }

  await product.save();

  return Response.json({ success: true });
}
