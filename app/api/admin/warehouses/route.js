// app/api/admin/warehouses/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Warehouse from "@/models/Warehouse";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";

async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

// GET all warehouses
export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const warehouses = await Warehouse.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, warehouses });
  } catch (error) {
    console.error("GET WAREHOUSES ERROR:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status });
  }
}

// CREATE a warehouse
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { name, location, address, city, state, pincode, capacity } = await req.json();

    if (!name) return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });

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
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status });
  }
}

// DELETE a warehouse
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = params;
    if (!id) return NextResponse.json({ success: false, message: "Warehouse ID required" }, { status: 400 });

    await Warehouse.deleteOne({ _id: id });
    return NextResponse.json({ success: true, message: "Warehouse deleted" });
  } catch (error) {
    console.error("DELETE WAREHOUSE ERROR:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status });
  }
}
