import dbConnect from "@/lib/db";
import Order from "@/models/Order";

/* ================= CORE STATUS HANDLER ================= */
async function handleStatusChange(order, newStatus) {
  let changed = false;

  /* ================= PAID LOGIC ================= */
  if (newStatus === "PAID") {
    const { handleOrderPaid } = await import("@/lib/handleOrderPaid");

    changed = await handleOrderPaid(order, {
      mode: "MANUAL",
    });
  }

  /* ================= DISPATCHED LOGIC ================= */
  if (newStatus === "DISPATCHED") {
    try {
      const { generateInvoiceHTML } = await import("@/lib/invoice");

      order.invoiceHTML = generateInvoiceHTML(order.toObject());

      const { sendInvoiceEmail } = await import("@/lib/email");
      const { sendWhatsAppInvoice } = await import("@/lib/whatsapp");

      await sendInvoiceEmail(order);
      await sendWhatsAppInvoice(order);

      changed = true;
    } catch (err) {
      console.error("DISPATCHED handler error:", err);
    }
  }

  return changed;
}

/* ================= API ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const { id, status } = await req.json();

    if (!id || !status) {
      return Response.json({
        success: false,
        message: "Missing id or status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return Response.json({
        success: false,
        message: "Order not found",
      });
    }

    /* ================= UPDATE STATUS ================= */
    order.status = status;

    /* ================= RUN BUSINESS LOGIC ================= */
    await handleStatusChange(order, status);

    /* ================= SAVE ================= */
    await order.save();

    return Response.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);

    return Response.json({
      success: false,
      message: "Update failed",
    });
  }
}
