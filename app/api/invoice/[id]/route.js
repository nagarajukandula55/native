export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";
import { getBrowser } from "@/lib/chrome";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await Order.findOne({ orderId: id }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const company = await CompanySettings.findOne().lean();

    const browser = await getBrowser();
    const page = await browser.newPage();

    /* ================= HTML TEMPLATE ================= */

    const html = `
    <html>
    <head>
      <style>
        body { font-family: Arial; padding: 40px; color: #111; }
        .header { display:flex; justify-content:space-between; }
        .title { font-size:24px; font-weight:bold; }
        .box { margin-top:20px; padding:15px; border:1px solid #ddd; }
        table { width:100%; border-collapse:collapse; margin-top:20px; }
        th, td { border:1px solid #ddd; padding:8px; font-size:12px; }
        th { background:#f3f4f6; }
        .total { text-align:right; font-size:18px; font-weight:bold; }
      </style>
    </head>

    <body>

      <div class="header">
        <div>
          <div class="title">${company?.companyName || "Company"}</div>
          <div>${company?.addressLine1 || ""}</div>
        </div>

        <div>
          <h2>TAX INVOICE</h2>
          <p>Invoice: ${order.invoice?.invoiceNumber || "NA"}</p>
          <p>Order: ${order.orderId}</p>
        </div>
      </div>

      <div class="box">
        <h3>Bill To</h3>
        <p>${order.address?.name}</p>
        <p>${order.address?.phone}</p>
        <p>${order.address?.address}</p>
        <p>GST: ${order.address?.gstNumber || "N/A"}</p>
      </div>

      <table>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>GST%</th>
          <th>Total</th>
        </tr>

        ${order.items
          .map(
            (item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${item.name}</td>
            <td>${item.snapshot?.hsn || "N/A"}</td>
            <td>${item.qty}</td>
            <td>${item.gstPercent}%</td>
            <td>₹${item.total}</td>
          </tr>
        `
          )
          .join("")}
      </table>

      <div class="total">
        Grand Total: ₹${order.billing?.grandTotal}
      </div>

    </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${id}.pdf`,
      },
    });

  } catch (err) {
    console.log("INVOICE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Invoice generation failed",
      },
      { status: 500 }
    );
  }
}
