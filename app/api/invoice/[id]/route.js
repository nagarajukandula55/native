import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Company from "@/models/CompanySettings";
import PDFDocument from "pdfkit";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const order = await Order.findOne({ orderId: params.id }).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const company = await Company.findOne().lean();

    /* ================= PDF INIT ================= */
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    /* ================= HEADER ================= */
    doc
      .fontSize(18)
      .text(company?.companyName || "INVOICE", { align: "left" });

    doc
      .fontSize(10)
      .text(company?.brandTagline || "", { align: "left" });

    doc.moveDown();

    /* ================= ORDER INFO ================= */
    doc.fontSize(12).text(`Invoice No: ${order.invoice?.invoiceNumber || "NA"}`);
    doc.text(`Order ID: ${order.orderId}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);

    doc.moveDown();

    /* ================= CUSTOMER ================= */
    doc.fontSize(12).text("Bill To:");
    doc.fontSize(10).text(order.address?.name || "Customer");
    doc.text(order.address?.phone || "");
    doc.text(order.address?.state || "");
    doc.moveDown();

    /* ================= ITEMS ================= */
    doc.fontSize(12).text("Items:");
    doc.moveDown(0.5);

    order.items?.forEach((i, idx) => {
      doc.fontSize(10).text(
        `${idx + 1}. ${i.name} | Qty: ${i.qty} | ₹${i.total}`
      );
    });

    doc.moveDown();

    /* ================= BILL SUMMARY ================= */
    doc.fontSize(12).text("Summary:");
    doc.fontSize(10).text(`Subtotal: ₹${order.billing?.subtotal || 0}`);
    doc.text(`Discount: ₹${order.billing?.discount || 0}`);

    const gst =
      (order.billing?.cgst || 0) +
      (order.billing?.sgst || 0) +
      (order.billing?.igst || 0);

    doc.text(`GST: ₹${gst}`);

    doc.fontSize(12).text(`TOTAL: ₹${order.billing?.total || 0}`);

    doc.moveDown();

    /* ================= FOOTER ================= */
    doc
      .fontSize(10)
      .text("Thank you for shopping with us!", { align: "center" });

    doc.end();

    /* ================= BUFFER BUILD ================= */
    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);
    });

    /* ================= RESPONSE ================= */
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=invoice-${order.orderId}.pdf`,
      },
    });
  } catch (err) {
    console.error("INVOICE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate invoice",
      },
      { status: 500 }
    );
  }
}
