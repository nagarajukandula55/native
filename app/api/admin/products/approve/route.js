export async function POST(req) {
  try {
    await connectDB();

    const { productKey, action } = await req.json();

    if (action === "approve") {
      await Product.updateMany(
        { productKey },
        {
          status: "approved",
          isActive: true,
        }
      );
    }

    if (action === "reject") {
      await Product.updateMany(
        { productKey },
        {
          status: "rejected",
          isActive: false,
        }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
