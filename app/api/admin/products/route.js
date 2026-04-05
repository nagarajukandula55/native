import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/Product";
import slugify from "slugify";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect DB
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
}

// Admin auth
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const jwt = require("jsonwebtoken");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.role || decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

// Generate SEO fields
function generateSEO(name, description) {
  const metaTitle = name + " | Native Store";
  const metaDescription = description
    ? description.substring(0, 160)
    : name + " available online";
  const tags = name.split(" ").map((t) => t.toLowerCase());
  return { metaTitle, metaDescription, tags };
}

// GET all products
export async function GET() {
  try {
    await connectDB();
    // Admin check is optional if public listing
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}

// POST create or update product
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();

    const {
      _id,
      name,
      category,
      subCategory,
      price,
      costPrice,
      mrp,
      discount,
      hsn,
      gstPercent,
      description,
      images,
      active,
    } = body;

    if (!name || !price || !category || !subCategory || !images?.length)
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });

    // Upload images to Cloudinary if they are base64 or URL
    const uploadedImages = [];
    for (const img of images) {
      if (img.startsWith("data:") || img.startsWith("http")) {
        const upload = await cloudinary.v2.uploader.upload(img, { folder: "products" });
        uploadedImages.push(upload.secure_url);
      } else {
        uploadedImages.push(img); // Already Cloudinary URL
      }
    }

    const slug = slugify(name, { lower: true, strict: true });

    const seo = generateSEO(name, description);

    let product;
    if (_id) {
      // Edit existing
      product = await Product.findByIdAndUpdate(
        _id,
        {
          name,
          slug,
          category,
          subCategory,
          price,
          costPrice,
          mrp,
          discount,
          hsn,
          gstPercent,
          description,
          images: uploadedImages,
          active,
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          tags: seo.tags,
        },
        { new: true }
      );
    } else {
      // Create new
      product = await Product.create({
        name,
        slug,
        category,
        subCategory,
        price,
        costPrice,
        mrp,
        discount,
        hsn,
        gstPercent,
        description,
        images: uploadedImages,
        active: active ?? true,
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        tags: seo.tags,
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error(err);
    const status = err.message.includes("Unauthorized") ? 401 : err.message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status });
  }
}
