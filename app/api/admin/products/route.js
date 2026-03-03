import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET all products
export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({});

    // Map _id to id for frontend convenience
    const mappedProducts = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description || "",
      price: p.price,
      image: p.image || "",
    }));

    return NextResponse.json(mappedProducts, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST a new product
export async function POST(req) {
  try {
    await connectToDB();
    const data = await req.json();

    const { name, description = "", price, image = "" } = data;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and Price are required" },
        { status: 400 }
      );
    }

    const newProduct = new Product({ name, description, price, image });
    await newProduct.save();

    // Return product with id field
    const responseProduct = {
      id: newProduct._id.toString(),
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      image: newProduct.image,
    };

    return NextResponse.json(
      { message: "Product added successfully", product: responseProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to save product" },
      { status: 500 }
    );
  }
}
