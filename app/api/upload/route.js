import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      stream.end(buffer)
    })

    return NextResponse.json({
      url: uploadResult.secure_url
    })

  } catch (error) {
    console.error("UPLOAD ERROR:", error)

    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    )
  }
}
