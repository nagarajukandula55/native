export async function POST(req) {
  await connectDB();

  const { productId, action, reason } = await req.json();

  const product = await Product.findOne({ productKey: productId });

  if (!product) {
    return NextResponse.json({ success: false });
  }

  const beforeStatus = product.status;

  if (action === "approve") {
    product.status = "approved";
    product.isActive = true;
    product.isListed = true;
    product.approvedAt = new Date();
  }

  if (action === "reject") {
    product.status = "rejected";
    product.rejectedReason = reason || "Not specified";
    product.rejectedAt = new Date();
  }

  product.history.push({
    action: action === "approve" ? "APPROVE" : "REJECT",
    before: { status: beforeStatus },
    after: { status: product.status },
    reason,
    changedBy: "approver",
  });

  await product.save();

  return NextResponse.json({ success: true });
}
