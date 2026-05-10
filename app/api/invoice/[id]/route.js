export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

import path from "path";

const money = (n) =>
  `₹${Number(n || 0).toFixed(2)}`;

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await Order.findOne({
      orderId: id,
    }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    const company =
      await CompanySettings.findOne().lean();

    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const buffers = [];

    pdf.on("data", buffers.push.bind(buffers));

    /* ================= HEADER ================= */

    if (company?.logoUrl) {
      try {
        pdf.image(
          `public${company.logoUrl}`,
          40,
          35,
          {
            width: 55,
          }
        );
      } catch (e) {
        console.log("LOGO ERROR");
      }
    }

    pdf
      .fontSize(20)
      .text(
        company?.companyName || "Native",
        110,
        40
      );

    pdf
      .fontSize(10)
      .text(
        company?.brandTagline || "",
        110,
        65
      );

    pdf.moveDown(2);

    /* ================= INVOICE TITLE ================= */

    pdf
      .fontSize(22)
      .text("TAX INVOICE", {
        align: "right",
      });

    pdf.moveDown();

    /* ================= COMPANY ================= */

    pdf
      .fontSize(10)
      .text(
        `${company?.addressLine1 || ""}`
      );

    pdf.text(
      `${company?.city || ""} - ${
        company?.pincode || ""
      }`
    );

    pdf.text(
      `GSTIN: ${company?.gstin || ""}`
    );

    pdf.text(
      `Phone: ${company?.phone || ""}`
    );

    pdf.text(
      `Email: ${company?.email || ""}`
    );

    pdf.moveDown();

    /* ================= ORDER ================= */

    pdf.text(
      `Invoice No: ${
        order.invoice?.invoiceNumber || "NA"
      }`
    );

    pdf.text(`Order ID: ${order.orderId}`);

    pdf.text(
      `Date: ${new Date(
        order.createdAt
      ).toLocaleString()}`
    );

    pdf.text(
      `Payment Method: ${
        order.payment?.method || "-"
      }`
    );

    if (
      order.payment?.razorpay_payment_id
    ) {
      pdf.text(
        `Transaction ID: ${order.payment.razorpay_payment_id}`
      );
    }

    pdf.moveDown();

    /* ================= BILL TO ================= */

    pdf
      .fontSize(12)
      .text("Bill To");

    pdf
      .fontSize(10)
      .text(order.address?.name || "");

    pdf.text(order.address?.phone || "");

    pdf.text(order.address?.address || "");

    pdf.text(
      `${order.address?.city || ""} - ${
        order.address?.pincode || ""
      }`
    );

    pdf.text(order.address?.state || "");

    if (order.address?.gstNumber) {
      pdf.text(
        `GSTIN: ${order.address.gstNumber}`
      );
    }

    pdf.moveDown(1.5);

    /* ================= TABLE ================= */

    const tableTop = pdf.y;

    pdf
      .fontSize(10)
      .text("#", 40, tableTop);

    pdf.text("Item", 70, tableTop);

    pdf.text("HSN", 240, tableTop);

    pdf.text("Qty", 320, tableTop);

    pdf.text("GST%", 370, tableTop);

    pdf.text("Total", 450, tableTop);

    let y = tableTop + 20;

    order.items?.forEach((item, idx) => {
      pdf.text(String(idx + 1), 40, y);

      pdf.text(
        item.name || "",
        70,
        y,
        {
          width: 150,
        }
      );

      pdf.text(
        item.snapshot?.hsn || "-",
        240,
        y
      );

      pdf.text(
        String(item.qty || 1),
        320,
        y
      );

      pdf.text(
        `${item.gstPercent || 0}%`,
        370,
        y
      );

      pdf.text(
        money(item.total),
        450,
        y
      );

      y += 24;
    });

    pdf.moveDown(3);

    /* ================= SUMMARY ================= */

    pdf.text(
      `Subtotal: ${money(
        order.billing?.subtotal
      )}`,
      {
        align: "right",
      }
    );

    pdf.text(
      `Discount: ${money(
        order.billing?.discount
      )}`,
      {
        align: "right",
      }
    );

    if (
      Number(order.billing?.igst || 0) > 0
    ) {
      pdf.text(
        `IGST: ${money(
          order.billing?.igst
        )}`,
        {
          align: "right",
        }
      );
    } else {
      pdf.text(
        `CGST: ${money(
          order.billing?.cgst
        )}`,
        {
          align: "right",
        }
      );

      pdf.text(
        `SGST: ${money(
          order.billing?.sgst
        )}`,
        {
          align: "right",
        }
      );
    }

    pdf
      .fontSize(14)
      .text(
        `Grand Total: ${money(
          order.billing?.grandTotal
        )}`,
        {
          align: "right",
        }
      );

    pdf.moveDown(2);

    /* ================= DECLARATION ================= */

    pdf
      .fontSize(11)
      .text("Declaration");

    pdf
      .fontSize(9)
      .text(
        "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."
      );

    pdf.moveDown(2);

    /* ================= FOOTER ================= */

    const logoPath = path.join(
      process.cwd(),
      "public",
      company.logoUrl
    );
    
    pdf.image(logoPath, 40, 35, {
      width: 55,
    });
      } catch (e) {}
    }

    const signPath = path.join(
      process.cwd(),
      "public",
      company.signatureUrl
    );
    
    pdf.image(signPath, 420, pdf.y, {
      width: 100,
    });
      } catch (e) {}
    }

    pdf.moveDown(4);

    pdf.text(
      "Authorised Signatory",
      400
    );

    /* ================= END ================= */

    pdf.end();

    const pdfBuffer =
      await new Promise((resolve) => {
        const chunks = [];

        pdf.on("data", (chunk) =>
          chunks.push(chunk)
        );

        pdf.on("end", () => {
          resolve(Buffer.concat(chunks));
        });
      });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition": `inline; filename=${order.invoice?.invoiceNumber || order.orderId}.pdf`,
      },
    });
  } catch (err) {
    console.log("INVOICE PDF ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to generate invoice",
      },
      { status: 500 }
    );
  }
}
