import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const { productId, action, reason } = await req.json();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    /* ================= APPROVE ================= */
    if (action === "approve") {
      product.status = "approved";
      product.approvedAt = new Date();
    }

    /* ================= REJECT ================= */
    if (action === "reject") {
      product.status = "rejected";
      product.rejectedAt = new Date();
      product.rejectedReason = reason || "Not specified";

      // 🔥 IMPORTANT: send back to vendor for edit flow
      product.editRequired = true;
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: `Product ${action}d successfully`,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
