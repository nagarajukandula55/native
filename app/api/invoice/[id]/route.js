import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Company from "@/models/CompanySettings";
import PDFDocument from "pdfkit";

export async function GET(req, { params }) {
  await dbConnect();

  const order = await Order.findOne({ orderId: params.id }).lean();
  const company = await Company.findOne().lean();

  if (!order) return NextResponse.json({ error: "Not found" });

  const doc = new PDFDocument({ size: "A4", margin: 40 });

  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  doc.on("end", () => {});

  /* HEADER */
  doc.fontSize(16).text(company.companyName);
  doc.fontSize(10).text(company.brandTagline);

  doc.moveDown();
  doc.text(`Invoice: ${order.invoice.invoiceNumber}`);
  doc.text(`Order: ${order.orderId}`);

  doc.moveDown();

  /* ITEMS */
  order.items.forEach((i, idx) => {
    doc.text(`${idx + 1}. ${i.name} | ₹${i.total}`);
  });

  doc.moveDown();
  doc.text(`Total: ₹${order.billing.total}`);

  doc.end();

  const pdfBuffer = await new Promise(resolve => {
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${order.orderId}.pdf`,
    },
  });
}
