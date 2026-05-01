import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const cart = body?.cart;

    if (!Array.isArray(cart)) {
      return Response.json({
        success: false,
        message: "Invalid cart",
      });
    }

    const enrichedCart = await Promise.all(
      cart.map(async (item) => {
        try {
          let product = null;

          // ✅ SAFE OBJECT ID CHECK (CRITICAL FIX)
          if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
            product = await Product.findById(item.productId).lean();
          }

          return {
            ...item,

            // ✅ SAFE FALLBACKS
            name: product?.name || item.name || "Unknown Product",
            price: product?.price || item.price || 0,

            // ✅ GST + HSN FIX
            hsn: product?.hsn || item.hsn || "NOT_SET",
            gstPercent: product?.tax || item.gstPercent || 0,

            product: product
              ? {
                  hsn: product.hsn,
                  tax: product.tax,
                  name: product.name,
                }
              : null,
          };
        } catch (itemErr) {
          console.error("Item enrich error:", itemErr);

          // ✅ DO NOT BREAK ENTIRE CART
          return {
            ...item,
            hsn: item.hsn || "NOT_SET",
            gstPercent: item.gstPercent || 0,
          };
        }
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
