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
    
          if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
            product = await Product.findById(item.productId).lean();
          }
    
          if (!product && item.productKey) {
            product = await Product.findOne({
              productKey: item.productKey,
            }).lean();
          }
    
          return {
            ...item,
            name: product?.name || item.name || "Unknown Product",
            price: product?.price || item.price || 0,
    
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
        } catch (err) {
          console.error("Item enrich error:", err);
    
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
    console.error("🔥 Cart Enrich Error:", err);

    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}
