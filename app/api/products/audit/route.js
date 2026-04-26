import { NextResponse } from "next/server";

let auditDB = []; // replace with DB later

export async function POST(req) {
  const body = await req.json();

  const {
    productId,
    oldPrice,
    newPrice,
    changedBy,
    changeType
  } = body;

  const audit = {
    productId,
    oldPrice,
    newPrice,
    changedBy,
    changeType: changeType || "MANUAL",
    timestamp: new Date()
  };

  auditDB.push(audit);

  return NextResponse.json({
    success: true,
    audit
  });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    auditDB
  });
}
