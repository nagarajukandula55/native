import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import slugify from "slugify";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Auth middleware
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

// Auto generate SEO and tags
function generateSEOAndTags(name, description) {
  const seoTitle = `${name} | Buy Online at Our Store`;
  const seoDescription = description
    ? `${description.substring(0, 150)}...`
    : `Buy ${name} at best price online.`;
  const tags = name
    .split(" ")
    .map((t) => t.toLowerCase())
    .slice(0, 10);
  return { seoTitle, seoDescription, tags };
}

// Auto GST based on GST category
function getGSTAndHSN(gstCategory) {
  const gstData = {
    "Food - Batter Mix": { hsn: "1901", gst: 5 },
    "Food - Spices": { hsn: "0904", gst: 5 },
    "Food - Honey": { hsn: "0409", gst: 12 },
    "Food - Chutney Mix": { hsn: "2103", gst: 18 },
    "Food - Masala": { hsn: "0909", gst: 12 },
    "Food - Cold Pressed Oil": { hsn: "1515", gst: 5 },
  };
  return gstData[gstCategory] || { hsn: "", gst: 0 };
}

// GET products
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().populate("category").lean();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST create or edit product
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    const {
      _id,
      name,
      description,
      categoryId,
      gstCategory,
      mrp,
      costPrice,
      discount,
      images, // array of base64 or URL
      status,
    } = body;

    if (!name || !categoryId || !mrp) {
      return NextResponse.json(
        { success: false, message: "Name, category, and MRP are required" },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const uploadedImages = [];
    if (images && images.length > 0) {
      for (const img of images) {
        if (!img.startsWith("http")) {
          const uploaded = await cloudinary.uploader.upload(img, {
            folder: "products",
          });
          uploadedImages.push(uploaded.secure_url);
        } else {
          uploadedImages.push(img);
        }
      }
    }

    // Auto SEO and tags
    const { seoTitle, seoDescription, tags } = generateSEOAndTags(name, description);

    // GST and HSN
    const { gst, hsn } = getGSTAndHSN(gstCategory);

    const productData = {
      name,
      description,
      category: categoryId,
      gstCategory,
      hsn,
      gst,
      mrp,
      costPrice,
      discount: discount || 0,
      sellingPrice: mrp - (discount || 0) * (mrp / 100),
      images: uploadedImages,
      seoTitle,
      seoDescription,
      tags,
      status: status || "active",
      slug: slugify(name, { lower: true }),
    };

    let product;
    if (_id) {
      product = await Product.findByIdAndUpdate(_id, productData, { new: true });
    } else {
      product = await Product.create(productData);
    }

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error(err);
    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;
    return NextResponse.json({ success: false, message: err.message }, { status });
  }
}
