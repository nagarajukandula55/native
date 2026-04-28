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

    // ================= VARIANTS =================
    let variants = (body.variants || []).map((v) => ({
      value: v?.value || "default",
      unit: v?.unit || "GM",
      sku: v?.sku || body.sku || `SKU-${Date.now()}`,
      mrp: Number(v?.mrp || body.mrp || 0),
      sellingPrice: Number(v?.sellingPrice || body.sellingPrice || 0),
      stock: Number(v?.stock || 0),
      barcode: v?.barcode || "",
      qrCode: v?.qrCode || "",
    }));

    // 🔥 SAFETY: ensure at least one variant
    if (!variants.length) {
      variants = [
        {
          value: "default",
          unit: "GM",
          sku: body.sku || `SKU-${Date.now()}`,
          mrp: Number(body.mrp || 0),
          sellingPrice: Number(body.sellingPrice || 0),
          stock: 0,
          barcode: body.barcode || "",
          qrCode: body.qrCode || "",
        },
      ];
    }

    // ================= PRIMARY VARIANT (CRITICAL FIX) =================
    const primaryVariant = {
      sku: variants[0].sku,
      value: variants[0].value,
      unit: variants[0].unit,
      mrp: variants[0].mrp,
      sellingPrice: variants[0].sellingPrice,
      stock: variants[0].stock,
      barcode: variants[0].barcode || "",
      qrCode: variants[0].qrCode || "",
    };

    // ================= FINAL PRODUCT =================
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

      // VARIANTS
      variants,
      primaryVariant, // ✅ FIXED

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
