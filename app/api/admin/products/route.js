import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/* 🔥 TEMP MOCK DB (replace with real DB later) */
let PRODUCTS_DB = [];

/* ================= GET PRODUCTS ================= */
export async function GET() {
  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, products: [], message: "No token" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, products: [], message: "Invalid token" },
        { status: 401 }
      );
    }

    if (!["admin", "super_admin", "vendor"].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, products: [], message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      products: PRODUCTS_DB,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, products: [], message: "Server error" },
      { status: 500 }
    );
  }
}

/* ================= POST PRODUCT ================= */
export async function POST(req) {
  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    if (!["admin", "super_admin", "vendor"].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      name,
      productKey,
      variant,
      variantValue,
      variantUnit,
    } = body;

    /* 🔥 STEP 1: FIND EXISTING PRODUCTS */
    const existing = PRODUCTS_DB.filter(
      (p) => p.productKey === productKey
    );

    /* 🔥 STEP 2: FIND MAX SEQUENCE */
    let nextNumber = 1;

    if (existing.length > 0) {
      const numbers = existing.map((p) => {
        const parts = p.sku.split("-");
        return parseInt(parts[2]); // 001
      });

      nextNumber = Math.max(...numbers) + 1;
    }

    /* 🔥 STEP 3: FORMAT NUMBER */
    const sequence = String(nextNumber).padStart(3, "0");

    /* 🔥 STEP 4: FINAL SKU */
    const finalSKU = `NA-${productKey}-${sequence}-${variant}`;

    /* 🔥 SAVE PRODUCT */
    const newProduct = {
      ...body,
      sku: finalSKU,
      createdAt: new Date(),
    };

    PRODUCTS_DB.push(newProduct);

    return NextResponse.json({
      success: true,
      product: newProduct,
    });

  } catch (err) {
    console.error("POST ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
