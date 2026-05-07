export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import PDFDocument from "pdfkit";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import Company from "@/models/CompanySettings";

/* ================= HELPER ================= */
const money = (n) =>
  Number(n || 0).toFixed(2);

/* ================= API ================= */
export async function GET(req, { params }) {

  try {

    await dbConnect();

    /* ================= ORDER ================= */
    const order = await Order.findOne({
      orderId: params.id,
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

    /* ================= COMPANY ================= */
    const company =
      await Company.findOne().lean();

    /* ================= DOWNLOAD MODE ================= */
    const download =
      req.nextUrl.searchParams.get(
        "download"
      );

    /* ================= PDF ================= */
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    /* ================= BUFFER ================= */
    const pdfBuffer = await new Promise(
      (resolve, reject) => {

        const chunks = [];

        doc.on("data", (chunk) => {
          chunks.push(chunk);
        });

        doc.on("end", () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on("error", reject);

        /* =======================================================
           HEADER
        ======================================================= */

        doc
          .fontSize(22)
          .font("Helvetica-Bold")
          .text(
            company?.companyName ||
              "NATIVE",
            {
              align: "left",
            }
          );

        doc.moveDown(0.2);

        doc
          .fontSize(10)
          .font("Helvetica")
          .text(
            company?.brandTagline || ""
          );

        doc.text(
          company?.addressLine1 || ""
        );

        doc.text(
          `${company?.city || ""} - ${
            company?.pincode || ""
          }`
        );

        doc.text(
          `GSTIN: ${
            company?.gstin || "NA"
          }`
        );

        doc.moveDown();

        /* =======================================================
           INVOICE HEADER
        ======================================================= */

        doc
          .fontSize(20)
          .font("Helvetica-Bold")
          .text("TAX INVOICE", {
            align: "right",
          });

        doc.moveDown(0.5);

        doc
          .fontSize(11)
          .font("Helvetica");

        doc.text(
          `Invoice No: ${
            order.invoice?.invoiceNumber ||
            "NA"
          }`
        );

        doc.text(
          `Order ID: ${order.orderId}`
        );

        doc.text(
          `Date: ${new Date(
            order.createdAt
          ).toLocaleString()}`
        );

        doc.text(
          `Order Status: ${
            order.status || "NA"
          }`
        );

        doc.moveDown();

        /* =======================================================
           CUSTOMER
        ======================================================= */

        doc
          .fontSize(13)
          .font("Helvetica-Bold")
          .text("Bill To");

        doc
          .fontSize(10)
          .font("Helvetica");

        doc.text(
          order.address?.name || ""
        );

        doc.text(
          order.address?.phone || ""
        );

        doc.text(
          order.address?.email || ""
        );

        doc.text(
          order.address?.address || ""
        );

        doc.text(
          `${order.address?.city || ""} - ${
            order.address?.pincode || ""
          }`
        );

        doc.text(
          order.address?.state || ""
        );

        if (order.address?.gstNumber) {

          doc.text(
            `Customer GSTIN: ${order.address.gstNumber}`
          );
        }

        doc.moveDown();

        /* =======================================================
           ITEMS
        ======================================================= */

        doc
          .fontSize(13)
          .font("Helvetica-Bold")
          .text("Items");

        doc.moveDown(0.5);

        order.items?.forEach(
          (item, idx) => {

            doc
              .fontSize(11)
              .font("Helvetica-Bold")
              .text(
                `${idx + 1}. ${
                  item.name
                }`
              );

            doc
              .fontSize(10)
              .font("Helvetica");

            doc.text(
              `HSN: ${
                item.snapshot?.hsn ||
                "-"
              }`
            );

            doc.text(
              `Qty: ${item.qty}`
            );

            doc.text(
              `Price: ₹${money(
                item.price
              )}`
            );

            doc.text(
              `GST: ${
                item.gstPercent || 0
              }%`
            );

            doc.text(
              `Base Amount: ₹${money(
                item.baseAmount
              )}`
            );

            doc.text(
              `Taxable Amount: ₹${money(
                item.taxableAmount
              )}`
            );

            doc.text(
              `Total: ₹${money(
                item.total
              )}`
            );

            doc.moveDown(0.8);
          }
        );

        /* =======================================================
           BILLING SUMMARY
        ======================================================= */

        doc.moveDown();

        doc
          .fontSize(13)
          .font("Helvetica-Bold")
          .text("Billing Summary");

        doc.moveDown(0.5);

        doc
          .fontSize(10)
          .font("Helvetica");

        doc.text(
          `Subtotal: ₹${money(
            order.billing?.subtotal
          )}`
        );

        doc.text(
          `Discount: ₹${money(
            order.billing?.discount
          )}`
        );

        doc.text(
          `Taxable Amount: ₹${money(
            order.billing
              ?.taxableAmount
          )}`
        );

        /* ================= GST ================= */

        if (
          Number(order.billing?.igst || 0) >
          0
        ) {

          doc.text(
            `IGST: ₹${money(
              order.billing?.igst
            )}`
          );

        } else {

          doc.text(
            `CGST: ₹${money(
              order.billing?.cgst
            )}`
          );

          doc.text(
            `SGST: ₹${money(
              order.billing?.sgst
            )}`
          );
        }

        doc.text(
          `Total GST: ₹${money(
            order.billing?.totalGST
          )}`
        );

        doc.moveDown(0.5);

        doc
          .fontSize(15)
          .font("Helvetica-Bold")
          .text(
            `GRAND TOTAL: ₹${money(
              order.billing?.grandTotal
            )}`
          );

        /* =======================================================
           PAYMENT
        ======================================================= */

        doc.moveDown();

        doc
          .fontSize(13)
          .font("Helvetica-Bold")
          .text("Payment Details");

        doc.moveDown(0.5);

        doc
          .fontSize(10)
          .font("Helvetica");

        doc.text(
          `Method: ${
            order.payment?.method ||
            "NA"
          }`
        );

        doc.text(
          `Status: ${
            order.payment?.status ||
            "NA"
          }`
        );

        if (
          order.payment
            ?.razorpay_order_id
        ) {

          doc.text(
            `Razorpay Order ID: ${order.payment.razorpay_order_id}`
          );
        }

        if (
          order.payment
            ?.razorpay_payment_id
        ) {

          doc.text(
            `Transaction ID: ${order.payment.razorpay_payment_id}`
          );
        }

        if (order.payment?.utr) {

          doc.text(
            `UTR: ${order.payment.utr}`
          );
        }

        if (order.payment?.paidAt) {

          doc.text(
            `Paid At: ${new Date(
              order.payment.paidAt
            ).toLocaleString()}`
          );
        }

        /* =======================================================
           FOOTER
        ======================================================= */

        doc.moveDown(3);

        doc
          .fontSize(10)
          .font("Helvetica")
          .text(
            "Thank you for shopping with us!",
            {
              align: "center",
            }
          );

        doc.moveDown(0.5);

        doc.text(
          "This is a computer generated invoice.",
          {
            align: "center",
          }
        );

        /* =======================================================
           END PDF
        ======================================================= */

        doc.end();
      }
    );

    /* ================= RESPONSE ================= */
    return new NextResponse(
      pdfBuffer,
      {
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            download
              ? `attachment; filename=invoice-${order.orderId}.pdf`
              : `inline; filename=invoice-${order.orderId}.pdf`,
        },
      }
    );

  } catch (err) {

    console.error(
      "🔥 INVOICE ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err?.message ||
          "Invoice generation failed",
      },
      { status: 500 }
    );
  }
}
