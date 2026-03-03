import { getProducts, addProduct, updateProduct, deleteProduct } from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(req) {
  const product = await req.json();
  const result = await addProduct(product);
  return NextResponse.json(result);
}

// For update and delete, use PATCH/DELETE with query param `id`
export async function PATCH(req) {
  const { id, ...fields } = await req.json();
  const result = await updateProduct(id, fields);
  return NextResponse.json(result);
}

export async function DELETE(req) {
  const { id } = await req.json();
  const result = await deleteProduct(id);
  return NextResponse.json(result);
}
