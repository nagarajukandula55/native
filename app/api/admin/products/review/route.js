import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req, { params }) {
  await dbConnect();

  const { id } = params;

  try {
    const product = await Product.findById(id); // 🔥 THIS IS THE FIX

    if (!product) {
      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      product,
    });
  } catch (err) {
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
