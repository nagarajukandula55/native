import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { generateInvoicePDF } from "@/lib/pdf/invoicePdf";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const pdfBuffer = await generateInvoicePDF(order.toObject());

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=invoice-${order.orderId}.pdf`,
      },
    });

  } catch (err) {
    console.error("PDF ERROR:", err);

    return new Response("Failed to generate PDF", {
      status: 500,
    });
  }
}
