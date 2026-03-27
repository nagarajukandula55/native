import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const labels = await Label.find({});
    return NextResponse.json({ success: true, labels });
  } catch (err) {
    return NextResponse.json({ success: false, msg: err.message });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const newLabel = await Label.create(data);
    return NextResponse.json({ success: true, label: newLabel });
  } catch (err) {
    return NextResponse.json({ success: false, msg: err.message });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    await Label.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, msg: err.message });
  }
}
