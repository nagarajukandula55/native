import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET all products
export async function GET() {
  try {
    await connectToDB();

    const products = await Product.find({}).lean();

    const mappedProducts = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description || "",
      price: p.price,
      image: p.image || "",
    }));

    return NextResponse.json({
      success: true,
      products: mappedProducts,
    });

  } catch (error) {
    console.error("GET /api/admin/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}


// ADD new product
export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();

    const name = body.name?.trim();
    const description = body.description?.trim() || "";
    const image = body.image?.trim() || "";
    const price = Number(body.price);

    if (!name || !price) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and Price are required",
        },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        product: {
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/admin/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save product",
      },
      { status: 500 }
    );
  }
}
