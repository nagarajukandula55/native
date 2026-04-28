import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("📦 Incoming Body:", body);

    // ================= REQUIRED CORE CHECK =================
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
    // 🔥 STEP 5 — SKU ENGINE (FINAL & CORRECT)
    // =====================================================

    const nameKey = String(body.name || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    const weight = String(body.totalWeight || "")
      .replace(/[^0-9]/g, "") || "0";

    // Find existing products with same name + weight
    const existingProducts = await Product.find({
      name: body.name,
      "primaryVariant.value": body.totalWeight
    });

    let maxSerial = 0;

    existingProducts.forEach((p) => {
      const match = p.primaryVariant?.sku?.match(/-(\d{3})-/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxSerial) maxSerial = num;
      }
    });

    const serial = String(maxSerial + 1).padStart(3, "0");

    const finalSKU = `NA-${nameKey}-${serial}-${weight}GM`;

    // =====================================================
    // 🔥 PRIMARY VARIANT (MANDATORY FIX)
    // =====================================================

    const primaryVariant = {
      sku: finalSKU,
      value: body.totalWeight,
      unit: "GM",
      mrp: Number(body.mrp || 0),
      sellingPrice: Number(body.sellingPrice || 0),
      stock: 0,
      barcode: body.barcode || "",
      qrCode: body.qrCode || "",
    };

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

      // 🔥 IMPORTANT
      variants: [], // disable for now (safe)
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
      status: "draft",
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

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// ================= GET =================

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

async function generateSKU({ name, weight, unit = "GM" }) {
  const cleanName = String(name || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  const prefix = "NA";
  const weightPart = `${weight || "NA"}${unit}`;

  // 🔍 Find existing SKUs for same product + weight
  const regex = new RegExp(`^${prefix}-${cleanName}-(\\d{3})-${weightPart}$`);

  const products = await Product.find({
    "variants.sku": { $regex: regex }
  }).select("variants.sku");

  let max = 0;

  products.forEach(p => {
    p.variants.forEach(v => {
      const match = v.sku.match(regex);
      if (match) {
        const num = parseInt(match[1]);
        if (num > max) max = num;
      }
    });
  });

  const next = String(max + 1).padStart(3, "0");

  return `${prefix}-${cleanName}-${next}-${weightPart}`;
}
