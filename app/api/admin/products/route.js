import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import GstCategory from "@/models/GstCategory";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";

/* ================= CLOUDINARY ================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/* ================= SKU ================= */
async function generateSKU(categoryId) {
  const count = await Product.countDocuments({ category: categoryId });
  return `SKU-${categoryId.toString().slice(-3)}-${(count + 1)
    .toString()
    .padStart(4, "0")}`;
}

/* ================= GET ================= */
export async function GET() {
  await connectDB();

  const products = await Product.find()
    .populate("category subcategory gstCategory")
    .sort({ createdAt: -1 });

  return NextResponse.json({ products });
}

/* ================= CREATE ================= */
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const name = formData.get("name");
    const slug = slugify(name, { lower: true });

    const category = formData.get("category");
    const subcategory = formData.get("subcategory");
    const gstId = formData.get("gstCategory");

    const gstData = await GstCategory.findById(gstId);

    /* ===== IMAGES ===== */
    const files = formData.getAll("images");
    let images = [];

    for (const file of files) {
      if (!file || file.size === 0) continue;

      const buffer = Buffer.from(await file.arrayBuffer());

      const res = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "products" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      images.push(res.secure_url);
    }

    /* ===== VARIANTS (SAFE PARSE) ===== */
    let variants = [];
    try {
      const raw = formData.get("variants");
      if (raw) variants = JSON.parse(raw);
    } catch (e) {
      variants = [];
    }

    /* ===== CLEAN VARIANTS ===== */
    variants = variants.map(v => ({
      type: v.type || "",
      value: v.value || "",
      cost: Number(v.cost) || 0,
      price: Number(v.price) || 0,
      stock: Number(v.stock) || 0,
      sku: v.sku || "",
    }));

    const sku = await generateSKU(category);

    const product = await Product.create({
      name,
      slug,
      description: formData.get("description"),
      brand: formData.get("brand"),

      category,
      subcategory,

      gstCategory: gstId,
      hsnCode: gstData?.hsn,
      gstPercent: gstData?.gst,

      costPrice: Number(formData.get("costPrice")) || 0,
      mrp: Number(formData.get("mrp")) || 0,
      sellingPrice: Number(formData.get("sellingPrice")) || 0,

      stock: Number(formData.get("stock")) || 0,

      variants, // ✅ NEW

      images,
      sku,
      status: formData.get("status"),
    });

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const id = formData.get("_id");

    const product = await Product.findById(id);
    if (!product)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const name = formData.get("name");

    product.name = name;
    product.slug = slugify(name, { lower: true });

    product.description = formData.get("description");
    product.brand = formData.get("brand");

    product.category = formData.get("category");
    product.subcategory = formData.get("subcategory");

    const gstId = formData.get("gstCategory");
    const gstData = await GstCategory.findById(gstId);

    product.gstCategory = gstId;
    product.hsnCode = gstData?.hsn;
    product.gstPercent = gstData?.gst;

    product.costPrice = Number(formData.get("costPrice")) || 0;
    product.mrp = Number(formData.get("mrp")) || 0;
    product.sellingPrice = Number(formData.get("sellingPrice")) || 0;

    product.stock = Number(formData.get("stock")) || 0;

    product.status = formData.get("status");

    /* ===== VARIANTS UPDATE ===== */
    try {
      const raw = formData.get("variants");
      if (raw) {
        let parsed = JSON.parse(raw);

        product.variants = parsed.map(v => ({
          type: v.type || "",
          value: v.value || "",
          cost: Number(v.cost) || 0,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          sku: v.sku || "",
        }));
      }
    } catch (e) {
      // ignore bad JSON
    }

    /* ===== IMAGES UPDATE ===== */
    const files = formData.getAll("images");

    if (files.length > 0 && files[0]?.size > 0) {
      let images = [];

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());

        const res = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "products" }, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            })
            .end(buffer);
        });

        images.push(res.secure_url);
      }

      product.images = images;
    }

    await product.save();

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

/* ================= DELETE ================= */
export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
