import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";

export async function GET() {
  try {
    await connectDB();
    const labels = await Label.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, labels });
  } catch (err) {
    return NextResponse.json({ success: false, msg: err.message });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    if (!data.name) return NextResponse.json({ success: false, msg: "Name required" });

    // create new or update existing
    let label;
    if (data._id) {
      label = await Label.findByIdAndUpdate(data._id, data, { new: true });
    } else {
      label = await Label.create(data);
    }

    return NextResponse.json({ success: true, label });
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
