import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

/* =====================================================
   🔥 SKU GENERATOR (FINAL - DB BASED AUTO INCREMENT)
===================================================== */
async function generateSKU({ name, weight, unit = "GM" }) {
  const cleanName = String(name || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  const prefix = "NA";
  const weightPart = `${weight || "NA"}${unit}`;

  // 🔍 Match existing SKUs
  const regex = new RegExp(`^${prefix}-${cleanName}-(\\d{3})-${weightPart}$`);

  // 🔥 IMPORTANT: check PRIMARY VARIANT (your system uses this)
  const products = await Product.find({
    "primaryVariant.sku": { $regex: regex }
  }).select("primaryVariant.sku");

  let max = 0;

  products.forEach(p => {
    const sku = p.primaryVariant?.sku || "";
    const match = sku.match(regex);

    if (match) {
      const num = parseInt(match[1]);
      if (num > max) max = num;
    }
  });

  const next = String(max + 1).padStart(3, "0");

  return `${prefix}-${cleanName}-${next}-${weightPart}`;
}

/* =====================================================
   🚀 POST CREATE PRODUCT
===================================================== */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("📦 Incoming Body:", body);

    // ================= REQUIRED CHECK =================
    const requiredFields = ["name", "productKey", "slug"];

    const missing = requiredFields.filter((f) => !body?.[f]);

    if (missing.length) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing fields: ${missing.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ================= INGREDIENTS =================
    const ingredients = (body.ingredients || []).map((i) => ({
      name: String(i?.name || ""),
      qty: Number(i?.qty || 0),
      unit: i?.unit || "GM",
      percent: Number(i?.percent || 0),
    }));

    // ================= NUTRITION =================
    const nutrition = {
      energy: Number(body.nutrition?.energy || 0),
      protein: Number(body.nutrition?.protein || 0),
      carbs: Number(body.nutrition?.carbs || 0),
      fat: Number(body.nutrition?.fat || 0),
    };

    // =====================================================
    // 🔥 FINAL SKU ENGINE (ONLY SOURCE OF TRUTH)
    // =====================================================
    const unit = body.unit || "GM";

    const finalSKU = await generateSKU({
      name: body.name,
      weight: body.totalWeight,
      unit,
    });

    // =====================================================
    // 🔥 PRIMARY VARIANT (MANDATORY)
    // =====================================================
    const primaryVariant = {
      sku: finalSKU,
      value: body.totalWeight || "default",
      unit: unit,

      mrp: Number(body.mrp || 0),
      sellingPrice: Number(body.sellingPrice || 0),
      stock: Number(body.stock || 0),

      barcode: body.barcode || "",
      qrCode: body.qrCode || "",
    };

    // =====================================================
    // 🔥 OPTIONAL: KEEP VARIANT ARRAY (FUTURE SAFE)
    // =====================================================
    const variants = [primaryVariant];

    // =====================================================
    // 🔥 FINAL PRODUCT OBJECT
    // =====================================================
    const productData = {
      // CORE
      name: body.name,
      slug: body.slug,
      productKey: body.productKey,

      category: body.category || "",
      brand: body.brand || "",
      subcategory: body.subcategory || "",

      // GST
      gstCategory: body.gstCategory || "",
      gstDescription: body.gstDescription || "",
      hsn: body.hsn || "",
      tax: Number(body.tax || 0),

      // CONTENT
      description: body.description || "",
      shortDescription: body.shortDescription || "",

      ingredients,
      nutrition,

      // MEDIA
      images: body.images || [],
      primaryImage: body.primaryImage || "",

      // 🔥 VARIANTS (NOW SAFE)
      variants,
      primaryVariant,

      // PRICING
      pricing: {
        mrp: Number(body.mrp || 0),
        sellingPrice: Number(body.sellingPrice || 0),
        priceWithGST: Number(body.priceWithGST || 0),
        baseCost: Number(body.baseCost || 0),
        packagingCost: Number(body.packagingCost || 0),
        logisticsCost: Number(body.logisticsCost || 0),
        marketingCost: Number(body.marketingCost || 0),
      },

      // SEO
      seo: body.seo || {},
      seoLocal: body.seoLocal || {},
      tags: body.tags || "",

      // AI
      ai: body.ai || {},

      // COMPLIANCE
      fssaiNumber: body.fssaiNumber || "",
      manufacturerName: body.manufacturerName || "",
      manufacturerAddress: body.manufacturerAddress || "",
      countryOfOrigin: body.countryOfOrigin || "India",

      storageInstructions: body.storageInstructions || "",
      allergenInfo: body.allergenInfo || "",
      usageInstructions: body.usageInstructions || "",
      safetyInfo: body.safetyInfo || "",

      // STATUS
      status: body.status,
      isActive: false,
      isListed: false,

      // WORKFLOW
      createdBy: body.createdBy || "admin",

      createdAt: new Date(),
    };

    // ================= SAVE =================
    const newProduct = await Product.create(productData);

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });

  } catch (error) {
    console.error("❌ PRODUCT CREATE ERROR:", error);
   console.log("✅ SAVED:", newProduct);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/* =====================================================
   📦 GET PRODUCTS
===================================================== */
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({})
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products,
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
