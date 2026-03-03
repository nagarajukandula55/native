import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({});
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const data = await req.json();

    const { name, description, price, image } = data;

    if (!name || !price) {
      return NextResponse.json({ error: "Name and Price are required" }, { status: 400 });
    }

    const newProduct = new Product({ name, description, price, image });
    await newProduct.save();

    return NextResponse.json({ message: "Product added successfully", product: newProduct }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}
