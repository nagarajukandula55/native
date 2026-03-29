export async function POST(req) {
  await connectDB();

  const { productId, warehouseId, qty } = await req.json();

  if (!productId || !warehouseId || qty === undefined) {
    return NextResponse.json(
      { success: false, message: "productId, warehouseId, qty required" },
      { status: 400 }
    );
  }

  let inventory = await Inventory.findOne({ productId, warehouseId });

  if (inventory) {
    inventory.availableQty += qty;
  } else {
    inventory = await Inventory.create({
      productId,
      warehouseId,
      availableQty: qty,
    });
  }

  await inventory.save();

  return NextResponse.json({ success: true, inventory });
}
