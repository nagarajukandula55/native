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

    // ================= NORMALIZE INGREDIENTS =================
    const ingredients = (body.ingredients || []).map((i) => ({
      name: i.name || "",
      qty: Number(i.qty || 0),
      unit: i.unit || "GM",
      percent: Number(i.percent || 0),
    }));

    // ================= NORMALIZE NUTRITION =================
    const nutrition = {
      energy: Number(body.nutrition?.energy || 0),
      protein: Number(body.nutrition?.protein || 0),
      carbs: Number(body.nutrition?.carbs || 0),
      fat: Number(body.nutrition?.fat || 0),
    };

    // ================= NORMALIZE VARIANTS =================
    const variants = (body.variants || []).map((v) => ({
      value: v.value || "",
      unit: v.unit || "GM",
      sku: v.sku || body.sku || `SKU-${Date.now()}`, // 🔥 FIX CRASH
      mrp: Number(v.mrp || 0),
      sellingPrice: Number(v.sellingPrice || 0),
      stock: Number(v.stock || 0),
      barcode: v.barcode || "",
      qrCode: v.qrCode || "",
    }));

    // ================= FINAL CLEAN PRODUCT =================
    const productData = {
      name: body.name,
      slug: body.slug,
      productKey: body.productKey,

      category: body.category,
      brand: body.brand,
      subcategory: body.subcategory,

      gstCategory: body.gstCategory,
      gstDescription: body.gstDescription,
      hsn: body.hsn,
      tax: Number(body.tax || 0),

      description: body.description,
      shortDescription: body.shortDescription,

      ingredients,
      nutrition,
      variants,

      images: body.images || [],
      primaryImage: body.primaryImage || "",

      productId: body.productId || body.productKey,

      barcode: body.barcode || "",
      qrCode: body.qrCode || "",

      pricing: {
        mrp: Number(body.mrp || 0),
        sellingPrice: Number(body.sellingPrice || 0),
        priceWithGST: Number(body.priceWithGST || 0),
        baseCost: Number(body.baseCost || 0),
        packagingCost: Number(body.packagingCost || 0),
        logisticsCost: Number(body.logisticsCost || 0),
        marketingCost: Number(body.marketingCost || 0),
      },

      seo: body.seo || {},
      seoLocal: body.seoLocal || {},
      tags: body.tags || "",

      aiContent: body.aiContent || {},
      aiSEO: body.aiSEO || {},

      fssaiNumber: body.fssaiNumber || "",
      manufacturerName: body.manufacturerName || "",
      manufacturerAddress: body.manufacturerAddress || "",

      countryOfOrigin: body.countryOfOrigin || "India",

      storageInstructions: body.storageInstructions || "",
      allergenInfo: body.allergenInfo || "",
      usageInstructions: body.usageInstructions || "",
      safetyInfo: body.safetyInfo || "",

      status: "draft",
      isActive: false,

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
