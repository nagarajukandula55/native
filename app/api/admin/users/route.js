// app/api/admin/users/route.js
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

    const users = await User.find({}, "-password").sort({ createdAt: -1 }).lean();
    const warehouses = await Warehouse.find({}).lean();

    const usersWithWarehouse = users.map((u) => {
      const warehouse = warehouses.find(
        (w) => u.warehouseId && w._id.toString() === u.warehouseId.toString()
      );
      return {
        ...u,
        warehouseName: warehouse?.name || null,
        warehouseCode: warehouse?.code || null,
      };
    });

    return NextResponse.json(usersWithWarehouse);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

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
    if (warehouseId !== undefined) user.warehouseId = warehouseId;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Return updated user including warehouse info
    let warehouseName = null;
    let warehouseCode = null;
    if (user.warehouseId) {
      const warehouse = await Warehouse.findById(user.warehouseId);
      if (warehouse) {
        warehouseName = warehouse.name;
        warehouseCode = warehouse.code;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user.toObject(),
        warehouseName,
        warehouseCode,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
