import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import slugify from "slugify";

export const dynamic = "force-dynamic";

/* ================= CONNECT DB ================= */
async function dbConnect() {
  await connectDB();
}

/* ================= AUTO GST / HSN ================= */
function autoGSTandHSN(category) {
  // Example mapping: extend as per your food category standards
  const mapping = {
    "Batter Mix": { hsn: "19019099", gst: 5 },
    "Spices": { hsn: "090999", gst: 5 },
    "Chutney Mix": { hsn: "210390", gst: 5 },
    "Honey": { hsn: "040900", gst: 12 },
    "Masala": { hsn: "210330", gst: 5 },
    "Cold Pressed Oil": { hsn: "150890", gst: 18 },
  };

  return mapping[category] || { hsn: "", gst: 0 };
}

/* ================= SEO & TAGS ================= */
function generateSEO(product) {
  const seoTitle = `${product.name} | Best Price | Buy Online`;
  const seoDesc = `Buy ${product.name} online at best prices. ${
    product.subCategory ? product.subCategory + " " : ""
  }Available with discount upto ${product.discount}%. GST applicable.`;

  const tags = product.name
    .split(" ")
    .map((t) => t.toLowerCase())
    .slice(0, 10);

  return { seoTitle, seoDesc, tags };
}

/* ================= GET PRODUCTS ================= */
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({})
      .populate("category", "name type")
      .lean();

    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}

/* ================= CREATE PRODUCT ================= */
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name || !body.category) {
      return NextResponse.json({ success: false, message: "Name and category required" }, { status: 400 });
    }

    // SLUG
    const slug = slugify(body.name, { lower: true, strict: true });

    // CHECK EXISTING
    const exists = await Product.findOne({ slug });
    if (exists) return NextResponse.json({ success: false, message: "Product already exists" }, { status: 400 });

    // GST / HSN
    const catObj = await Category.findById(body.category);
    const { hsn, gst } = catObj?.type === "gst" ? autoGSTandHSN(catObj.name) : { hsn: "", gst: 0 };

    // SEO
    const { seoTitle, seoDesc, tags } = generateSEO(body);

    // CALCULATE FINAL PRICE WITH DISCOUNT
    const finalPrice = body.price - (body.price * (body.discount || 0)) / 100;

    const product = await Product.create({
      ...body,
      slug,
      hsn,
      gst,
      seoTitle,
      seoDesc,
      tags,
      finalPrice,
    });

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 });
  }
}

/* ================= UPDATE PRODUCT ================= */
export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body._id) return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });

    const product = await Product.findById(body._id);
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });

    // UPDATE FIELDS
    product.name = body.name || product.name;
    product.category = body.category || product.category;
    product.subCategory = body.subCategory || product.subCategory;
    product.price = body.price ?? product.price;
    product.mrp = body.mrp ?? product.mrp;
    product.costPrice = body.costPrice ?? product.costPrice;
    product.discount = body.discount ?? product.discount;
    product.images = body.images || product.images;
    product.description = body.description || product.description;
    product.active = body.active ?? product.active;

    // REGENERATE SEO & TAGS
    const { seoTitle, seoDesc, tags } = generateSEO(product);
    product.seoTitle = seoTitle;
    product.seoDesc = seoDesc;
    product.tags = tags;

    // GST / HSN
    const catObj = await Category.findById(product.category);
    if (catObj?.type === "gst") {
      const { hsn, gst } = autoGSTandHSN(catObj.name);
      product.hsn = hsn;
      product.gst = gst;
    }

    // FINAL PRICE
    product.finalPrice = product.price - (product.price * (product.discount || 0)) / 100;

    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 });
  }
}
