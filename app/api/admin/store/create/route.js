import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Store from "@/models/Store";
import Warehouse from "@/models/Warehouse";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: "Name, email & password required",
      });
    }

    // Get any warehouse (default assignment)
    const warehouse = await Warehouse.findOne();

    if (!warehouse) {
      return NextResponse.json({
        success: false,
        message: "No warehouse found. Create warehouse first.",
      });
    }

    const existing = await Store.findOne({ email });
    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Store already exists",
      });
    }

    const store = await Store.create({
      name,
      email,
      password, // will auto hash from model
      warehouseId: warehouse._id, // ✅ IMPORTANT
    });

    return NextResponse.json({
      success: true,
      message: "Store created",
      storeId: store._id,
    });
  } catch (err) {
    console.error("CREATE STORE ERROR:", err);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
