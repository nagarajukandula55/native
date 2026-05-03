import dbConnect from "@/lib/db";
import Order from "@/models/Order";

order.status = "DISPATCHED";
order.dispatchedAt = new Date();

/* ================= CORE STATUS HANDLER ================= */
async function handleStatusChange(order, newStatus) {
  let changed = false;

  /* ================= PAID LOGIC ================= */
  if (newStatus === "PAID") {
    const { handleOrderPaid } = await import("@/lib/handleOrderPaid");

    const result = await handleOrderPaid(order, {
      mode: "MANUAL",
    });

    if (result) changed = true;
  }

  /* ================= DISPATCHED LOGIC ================= */
  if (newStatus === "DISPATCHED") {
    try {
      /* ================= INVOICE GENERATION ================= */
      const { generateInvoiceHTML } = await import("@/lib/invoice");

      order.invoiceHTML = generateInvoiceHTML(order.toObject());

      /* ================= EMAIL + WHATSAPP ================= */
      const { sendInvoiceEmail } = await import("@/lib/notifications/email");
      const { sendWhatsAppInvoice } = await import("@/lib/notifications/whatsapp");

      /* ================= IDEMPOTENT SAFETY ================= */
      if (!order.invoiceSentAt) {
        await sendInvoiceEmail(order);
        order.invoiceSentAt = new Date();
      }

      if (!order.whatsappInvoiceSentAt) {
        await sendWhatsAppInvoice(order);
        order.whatsappInvoiceSentAt = new Date();
      }

      changed = true;
    } catch (err) {
      console.error("DISPATCHED handler error:", err);
    }
  }

  return changed;
}

/* ================= API ROUTE ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const { id, status } = await req.json();

    /* ================= VALIDATION ================= */
    if (!id || !status) {
      return Response.json({
        success: false,
        message: "Missing id or status",
      }, { status: 400 });
    }

    /* ================= FETCH ORDER ================= */
    const order = await Order.findById(id);

    if (!order) {
      return Response.json({
        success: false,
        message: "Order not found",
      }, { status: 404 });
    }

    /* ================= IDEMPOTENCY CHECK ================= */
    if (order.status === status) {
      return Response.json({
        success: true,
        message: "Already in requested status",
        order,
      });
    }

    /* ================= UPDATE STATUS ================= */
    order.status = status;

    /* ================= BUSINESS LOGIC ================= */
    await handleStatusChange(order, status);

    /* ================= SAVE FINAL STATE ================= */
    await order.save();

    return Response.json({
      success: true,
      message: "Status updated successfully",
      order,
    });

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);

    return Response.json({
      success: false,
      message: "Update failed",
    }, { status: 500 });
  }
}
