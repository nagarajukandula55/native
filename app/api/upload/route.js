import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "products" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

  return NextResponse.json({
    url: uploadResult.secure_url,
  });
}
