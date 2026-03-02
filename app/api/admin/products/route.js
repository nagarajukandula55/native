import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  await connectDB();
  const products = await Product.find();
  return new Response(JSON.stringify(products), { status: 200 });
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const product = new Product(data);
  await product.save();
  return new Response(JSON.stringify(product), { status: 201 });
}
