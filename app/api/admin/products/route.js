import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET PRODUCTS
export async function GET() {
  try {
    await connectToDB();

    const products = await Product.find({}).lean();

    const formattedProducts = Array.isArray(products)
      ? products.map((p) => ({
          id: p._id.toString(),
          name: p.name || "",
          description: p.description || "",
          price: p.price || 0,
          image: p.image || "",
        }))
      : [];

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });

  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        products: [],
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}


// ADD PRODUCT
export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();

    const product = await Product.create({
      name: body.name,
      description: body.description || "",
      price: Number(body.price),
      image: body.image || "",
    });

    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description || "",
      price: product.price,
      image: product.image || "",
    };

    return NextResponse.json({
      success: true,
      product: formattedProduct,
    });

  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product",
      },
      { status: 500 }
    );
  }
}
