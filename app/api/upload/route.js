import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, { folder: "products" });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
