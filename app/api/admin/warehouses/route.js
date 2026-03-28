// app/api/admin/warehouses/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Warehouse from "@/models/Warehouse";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const warehouses = await Warehouse.find({}).sort({ createdAt: -1 });
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("GET WAREHOUSES ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { name, location, address, city, state, pincode, capacity } = await req.json();
    if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 });

    // Auto-generate code: first 3 letters + last 3 digits of timestamp
    const code = name.slice(0, 3).toUpperCase() + Date.now().toString().slice(-3);

    const warehouse = await Warehouse.create({
      name,
      code,
      location,
      address,
      city,
      state,
      pincode,
      capacity,
    });

    return NextResponse.json({ success: true, warehouse });
  } catch (error) {
    console.error("CREATE WAREHOUSE ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = params;
    if (!id) return NextResponse.json({ message: "Warehouse ID required" }, { status: 400 });

    await Warehouse.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE WAREHOUSE ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
