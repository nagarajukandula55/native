import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

/* ================= AUTH ================= */

async function getUser() {
  const token = cookies().get("token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/* ================= UPDATE PRODUCT ================= */

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const user = await getUser();

    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await req.json();

    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    /* 🔥 ROLE CONTROL */
    if (user.role === "vendor") {
      // vendor can only edit own products
      if (product.createdBy?.toString() !== user.id) {
        return NextResponse.json({ success: false }, { status: 403 });
      }

      // vendor cannot approve
      body.status = "review";
    }

    /* 🔥 APPROVAL LOGIC */
    if (body.action === "approve" && user.role === "super_admin") {
      product.status = "approved";
      product.approvedBy = user.id;
      product.approvedAt = new Date();
    }

    if (body.action === "reject" && user.role === "super_admin") {
      product.status = "rejected";
    }

    if (body.action === "list") {
      product.isListed = true;
    }

    if (body.action === "delist") {
      product.isListed = false;
    }

    /* 🔥 SAFE UPDATE (no overwrite of system fields) */
    const safeFields = {
      name: body.name,
      category: body.category,
      gstCategory: body.gstCategory,
      gstDescription: body.gstDescription,
      hsn: body.hsn,
      tax: body.tax,
      description: body.description,
      shortDescription: body.shortDescription,
      ingredients: body.ingredients,
      shelfLife: body.shelfLife,
      images: body.images,
      seo: body.seo,
      slug: body.slug,
    };

    Object.keys(safeFields).forEach((key) => {
      if (safeFields[key] !== undefined) {
        product[key] = safeFields[key];
      }
    });

    product.updatedBy = user.id;

    await product.save();

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}

/* ================= DELETE (SOFT DELETE) ================= */

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const user = await getUser();

    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    /* 🔥 ROLE CONTROL */
    if (user.role === "vendor") {
      if (product.createdBy?.toString() !== user.id) {
        return NextResponse.json({ success: false }, { status: 403 });
      }
    }

    /* 🔥 SOFT DELETE INSTEAD OF HARD DELETE */
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.deletedBy = user.id;

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product deleted safely",
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
