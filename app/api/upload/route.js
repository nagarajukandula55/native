import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

/* ================= CONFIG ================= */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= UPLOAD ================= */

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const sku = formData.get("sku") || "product";

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    /* 🔒 VALIDATION */
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 2MB allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    /* 🚀 UPLOAD */
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "products",
          public_id: `${sku}-${Date.now()}`,
          resource_type: "image",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
