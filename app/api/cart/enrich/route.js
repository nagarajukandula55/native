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

          /* ================= FIND PRODUCT (MULTI STRATEGY) ================= */

          // 1️⃣ Try Mongo _id
          if (
            item.productId &&
            mongoose.Types.ObjectId.isValid(item.productId)
          ) {
            product = await Product.findById(item.productId).lean();
          }

          // 2️⃣ Try productKey
          if (!product && item.productKey) {
            product = await Product.findOne({
              productKey: item.productKey,
            }).lean();
          }

          // 3️⃣ Try slug
          if (!product && item.slug) {
            product = await Product.findOne({
              slug: item.slug,
            }).lean();
          }

          /* ================= DEBUG LOG ================= */
          if (!product) {
            console.warn("⚠️ Product NOT FOUND for cart item:", item);
          } else {
            console.log("✅ Product FOUND:", product.name);
          }

          /* ================= FINAL RETURN ================= */
          return {
            ...item,

            name: product?.name || item.name || "Unknown Product",
            price: product?.price || item.price || 0,

            // ✅ HARD GUARANTEE (NO MORE NOT_SET IF DB HAS VALUE)
            hsn:
              product?.hsn && product.hsn !== ""
                ? product.hsn
                : item.hsn || "NOT_SET",

            gstPercent:
              typeof product?.tax === "number"
                ? product.tax
                : item.gstPercent || 0,

            product: product
              ? {
                  hsn: product.hsn,
                  tax: product.tax,
                  name: product.name,
                }
              : null,
          };
        } catch (itemErr) {
          console.error("❌ Item enrich error:", itemErr);

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
