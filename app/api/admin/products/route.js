import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import slugify from "slugify";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= AUTH ================= */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= SKU ================= */
async function generateSKU(name) {
  const cleaned = name.replace(/^Native\s+/i, "");
  const firstWord = cleaned.split(" ")[0].toUpperCase();

  const count = await Product.countDocuments({
    name: new RegExp(`^${firstWord}`, "i"),
  });

  return `NA${firstWord}${String(count + 1).padStart(3, "0")}`;
}

/* ================= TAGS ================= */
function generateTags(name) {
  return [...new Set(
    name
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .filter(Boolean)
  )];
}

/* ================= IMAGE UPLOAD ================= */
async function uploadToCloudinary(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "products" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

/* ================= GET ================= */
export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products });
  } catch (err) {
    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json({ success: false, message: err.message }, { status });
  }
}

/* ================= CREATE ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const gstCategory = formData.get("gstCategory");
    const hsnCode = formData.get("hsnCode");
    const gstPercent = Number(formData.get("gstPercent"));
    const costPrice = Number(formData.get("costPrice"));
    const mrp = Number(formData.get("mrp"));
    const sellingPrice = Number(formData.get("sellingPrice"));

    const files = formData.getAll("images");

    /* ===== VALIDATION ===== */
    if (!name || !category || !gstCategory || !hsnCode || !gstPercent) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "At least one image required" }, { status: 400 });
    }

    /* ===== SLUG ===== */
    let slug = slugify(name, { lower: true, strict: true });
    let exists = await Product.findOne({ slug });

    if (exists) slug += "-" + Date.now();

    /* ===== SKU ===== */
    const sku = await generateSKU(name);

    /* ===== IMAGE UPLOAD ===== */
    const imageUrls = await Promise.all(
      files.map(file => uploadToCloudinary(file))
    );

    /* ===== CREATE ===== */
    const product = await Product.create({
      name,
      slug,
      sku,
      description,
      category,
      gstCategory,
      hsnCode,
      gstPercent,
      costPrice,
      mrp,
      sellingPrice,
      discountPercent: Math.round(((mrp - sellingPrice) / mrp) * 100) || 0,
      tags: generateTags(name),
      images: imageUrls,
      featuredImage: imageUrls[0],
      seoTitle: name,
      seoDescription: description?.substring(0, 160) || name,
      status: "active",
    });

    return NextResponse.json({ success: true, product });

  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);

    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status }
    );
  }
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const formData = await req.formData();
    const id = formData.get("_id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const name = formData.get("name");

    let updatedData = {
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description: formData.get("description"),
      category: formData.get("category"),
      gstCategory: formData.get("gstCategory"),
      hsnCode: formData.get("hsnCode"),
      gstPercent: Number(formData.get("gstPercent")),
      costPrice: Number(formData.get("costPrice")),
      mrp: Number(formData.get("mrp")),
      sellingPrice: Number(formData.get("sellingPrice")),
      seoTitle: name,
      seoDescription: formData.get("description")?.substring(0, 160) || name,
      tags: generateTags(name),
    };

    /* ===== OPTIONAL IMAGE UPDATE ===== */
    const files = formData.getAll("images");

    if (files && files.length > 0 && files[0].size > 0) {
      const uploaded = await Promise.all(files.map(uploadToCloudinary));
      updatedData.images = uploaded;
      updatedData.featuredImage = uploaded[0];
    }

    Object.assign(product, updatedData);
    await product.save();

    return NextResponse.json({ success: true, product });

  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);

    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status }
    );
  }
}
