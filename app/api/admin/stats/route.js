import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";
import Product from "@/models/Product";
import Warehouse from "@/models/Warehouse";

export async function GET() {
  try {
    await connectDB();

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ["Order Placed", "Packed", "Shipped", "Out For Delivery"] } });
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const totalRevenueAgg = await Order.aggregate([{ $match: { paymentStatus: "Paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const totalProducts = await Product.countDocuments();
    const totalWarehouses = await Warehouse.countDocuments();
    const totalStockAgg = await Inventory.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }]);
    const totalStock = totalStockAgg[0]?.total || 0;

    return NextResponse.json({
      success: true,
      stats: { totalOrders, pendingOrders, deliveredOrders, totalRevenue, totalProducts, totalWarehouses, totalStock },
    });
  } catch (err) {
    console.error("STATS ERROR:", err);
    return NextResponse.json({ success: false });
  }
}
