import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Warehouse from "@/models/Warehouse";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    const warehouses = await Warehouse.find({});

    const usersWithWarehouse = users.map((u) => {
      const warehouse = warehouses.find((w) => w._id.toString() === u.warehouseId?.toString());
      return {
        ...u._doc,
        warehouseName: warehouse ? warehouse.name : null,
        warehouseCode: warehouse ? warehouse.code : null,
      };
    });

    return NextResponse.json(usersWithWarehouse);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Update store assignment / role / warehouse
export async function PUT(req) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id, role, warehouseId, isActive } = await req.json();
    if (!id) return NextResponse.json({ message: "User ID required" }, { status: 400 });

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (role) user.role = role;
    if (warehouseId !== undefined) {
      user.warehouseId = warehouseId;
      if (warehouseId) {
        const warehouse = await Warehouse.findById(warehouseId);
        user.warehouseName = warehouse?.name || null;
        user.warehouseCode = warehouse?.code || null;
      } else {
        user.warehouseName = null;
        user.warehouseCode = null;
      }
    }
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
