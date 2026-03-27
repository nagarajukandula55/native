import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Greeting from "@/models/Greeting";

export async function GET() {
  await connectDB();
  const greetings = await Greeting.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ success: true, greetings });
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const greeting = await Greeting.create(data);
  return NextResponse.json({ success: true, greeting });
}

export async function PUT(req) {
  await connectDB();
  const { id, ...updates } = await req.json();
  const greeting = await Greeting.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json({ success: true, greeting });
}

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();
  await Greeting.findByIdAndDelete(id);
  return NextResponse.json({ success: true, msg: "Greeting deleted" });
}
