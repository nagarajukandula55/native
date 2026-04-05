import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import GstCategory from "@/models/GstCategory";
import slugify from "slugify";
import cloudinary from "@/lib/cloudinary";

/* ================= SKU GENERATOR ================= */
async function generateSKU(name) {
  const words = name.trim().split(/\s+/);

  let core =
    words[0].toLowerCase() === "native" && words[1]
      ? words[1]
      : words[0];

  core = core.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const base = `NA${core}`;

  const count = await Product.countDocuments({
    sku: new RegExp(`^${base}`),
  });

  return `${base}${String(count + 1).padStart(3, "0")}`;
}

/* ================= GET ================= */
export async function GET() {
  await connectDB();

  const products = await Product.find()
    .populate("category subcategory gstCategory")
    .sort({ createdAt: -1 });

  return NextResponse.json(products);
}

/* ================= CREATE ================= */
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");

    const slug = slugify(name, { lower: true });

    const exists = await Product.findOne({ slug });
    if (exists) {
      return NextResponse.json({ error: "Product exists" }, { status: 400 });
    }

    const sku = await generateSKU(name);

    /* ==== GST AUTO ==== */
    const gstId = formData.get("gstCategory");
    const gstData = await GstCategory.findById(gstId);

    /* ==== IMAGE UPLOAD ==== */
    const files = formData.getAll("images");
    const uploaded = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const res = await cloudinary.uploader.upload_stream(
        { folder: "products" },
        (err, result) => {
          if (result) uploaded.push(result.secure_url);
        }
      );

      res.end(buffer);
    }

    const product = await Product.create({
      name,
      slug,
      sku,
      description,
      brand: formData.get("brand"),

      category: formData.get("category"),
      subcategory: formData.get("subcategory"),

      gstCategory: gstId,
      hsnCode: gstData?.hsn,
      gstPercent: gstData?.gst,

      costPrice: formData.get("costPrice"),
      mrp: formData.get("mrp"),
      sellingPrice: formData.get("sellingPrice"),

      images: uploaded,

      tags: name.toLowerCase().split(" "),

      status: formData.get("status"),
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
