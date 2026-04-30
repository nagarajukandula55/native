import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await dbConnect();

    const { cart } = await req.json();

    if (!Array.isArray(cart)) {
      return Response.json({
        success: false,
        message: "Invalid cart",
      });
    }

    const enrichedCart = await Promise.all(
      cart.map(async (item) => {
        const product = await Product.findById(item.productId).lean();

        return {
          ...item,

          // ✅ FIXED ENRICHMENT
          name: product?.name || item.name,
          price: product?.price || item.price,

          hsn: product?.hsn || "NOT_SET",
          gstPercent: product?.tax || 0,

          product: {
            hsn: product?.hsn,
            tax: product?.tax,
            name: product?.name,
          },
        };
      })
    );

    return Response.json({
      success: true,
      cart: enrichedCart,
    });
  } catch (err) {
    console.error("Cart Enrich Error:", err);

    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}
