import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BrandKit from "@/models/BrandKit";

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const kit = await BrandKit.create(body);
  return NextResponse.json({ success: true, kit });
}

export async function GET() {
  await connectDB();
  const kits = await BrandKit.find();
  return NextResponse.json({ success: true, kits });
}
