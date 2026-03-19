// app/api/orders/assign-warehouse/route.js
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";

export async function POST(req) {
  try {
    await dbConnect();

    const { orderId } = await req.json();
    if (!orderId)
      return new Response(
        JSON.stringify({ error: "Order ID required" }),
        { status: 400 }
      );

    const order = await Order.findById(orderId);
    if (!order)
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404 }
      );

    order.warehouseAssignments = [];
    const assignments = [];

    for (const item of order.items) {
      // Find warehouses with stock > 0 for this product
      const warehouses = await Warehouse.find({
        "stock.productId": item.productId,
        "stock.quantity": { $gt: 0 },
      }).sort({ "stock.quantity": -1 });

      let remainingQty = item.quantity;

      for (const wh of warehouses) {
        const stockEntry = wh.stock.find(
          (s) => s.productId.toString() === item.productId.toString()
        );
        if (!stockEntry) continue;

        const allocatedQty = Math.min(remainingQty, stockEntry.quantity);
        stockEntry.quantity -= allocatedQty;
        await wh.save();

        assignments.push({
          productId: item.productId,
          warehouseId: wh._id,
          quantity: allocatedQty,
        });

        remainingQty -= allocatedQty;
        if (remainingQty <= 0) break;
      }

      if (remainingQty > 0) {
        return new Response(
          JSON.stringify({
            error: `Insufficient stock for product ${item.productId}`,
          }),
          { status: 400 }
        );
      }
    }

    order.warehouseAssignments = assignments;
    await order.save();

    return new Response(
      JSON.stringify({ message: "Warehouses assigned", assignments }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
