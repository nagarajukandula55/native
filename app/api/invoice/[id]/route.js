import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { generateInvoicePDF } from "@/lib/pdf/invoicePdf";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const order = await Order.findOne({ orderId: params.id });

    if (!order) {
      return new Response("Not found", { status: 404 });
    }

    const pdfBuffer = await generateInvoicePDF(order.toObject());

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=invoice-${order.orderId}.pdf`,
      },
    });

  } catch (err) {
    console.error(err);
    return new Response("PDF error", { status: 500 });
  }
}
