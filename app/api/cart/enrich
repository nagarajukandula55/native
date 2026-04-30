import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await dbConnect();

    const { cart } = await req.json();

    if (!cart || !Array.isArray(cart)) {
      return Response.json({
        success: false,
        message: "Invalid cart data",
      });
    }

    const productIds = cart.map((i) => i.productId);

    // 🔥 FETCH ALL PRODUCTS IN ONE QUERY
    const products = await Product.find({
      _id: { $in: productIds },
    });

    const productMap = new Map(
      products.map((p) => [p._id.toString(), p])
    );

    // 🔥 ENRICH CART
    const enrichedCart = cart.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        return {
          ...item,
          hsn: "NOT_FOUND",
          tax: 0,
        };
      }

      return {
        ...item,

        // 🔥 SOURCE OF TRUTH FROM DB
        name: product.name,
        price: product.price,
        hsn: product.hsn || "UNKNOWN",
        tax: product.tax || 0,

        // keep qty intact
        qty: item.qty,
      };
    });

    return Response.json({
      success: true,
      cart: enrichedCart,
    });
  } catch (err) {
    console.error("Cart enrich error:", err);

    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}
