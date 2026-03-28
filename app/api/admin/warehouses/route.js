// app/api/admin/warehouses/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Warehouse from "@/models/Warehouse";
import User from "@/models/User";

const MONGODB_URI = process.env.MONGODB_URI;

// DB Connection
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
}

// Verify Admin Token
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET ALL WAREHOUSES ================= */
export async function GET() {
  try {
    await connectDB();
    await verifyAdmin({ cookies: { get: () => ({ value: req?.cookies?.get("token")?.value }) } });

    const warehouses = await Warehouse.find({}, "_id name code location").sort({ name: 1 });

    return NextResponse.json({ success: true, warehouses });
  } catch (error) {
    console.error("GET WAREHOUSES ERROR:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

/* ================= CREATE NEW WAREHOUSE ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    const { name, location } = body;

    if (!name || !location) {
      return NextResponse.json({ success: false, error: "Name and Location are required" }, { status: 400 });
    }

    // Check for duplicate warehouse name
    const exists = await Warehouse.findOne({ name: name.trim() });
    if (exists) {
      return NextResponse.json({ success: false, error: "Warehouse with this name already exists" }, { status: 400 });
    }

    // Generate warehouse code: first 3 letters + last 3 digits of timestamp
    const code = name.trim().slice(0, 3).toUpperCase() + Date.now().toString().slice(-3);

    const warehouse = await Warehouse.create({ name: name.trim(), location, code });

    return NextResponse.json({ success: true, warehouse: { _id: warehouse._id, name: warehouse.name, code: warehouse.code, location: warehouse.location } });
  } catch (error) {
    console.error("CREATE WAREHOUSE ERROR:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

/* ================= DELETE WAREHOUSE ================= */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: "Warehouse ID is required" }, { status: 400 });

    // Prevent deletion if warehouse has assigned stores
    const linkedStores = await User.find({ warehouseId: id });
    if (linkedStores.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Cannot delete warehouse: stores are assigned to it",
      }, { status: 400 });
    }

    await Warehouse.deleteOne({ _id: id });
    return NextResponse.json({ success: true, message: "Warehouse deleted successfully" });
  } catch (error) {
    console.error("DELETE WAREHOUSE ERROR:", error);
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
