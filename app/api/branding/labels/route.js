import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";

export async function GET() {
  try {
    await connectDB();
    const labels = await Label.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, labels });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const label = await Label.create(data);
    return NextResponse.json({ success: true, label });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const { id, ...updates } = await req.json();
    const label = await Label.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json({ success: true, label });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    await Label.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: err.message }, { status: 500 });
  }
}
