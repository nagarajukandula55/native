import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import AuditLog from "@/models/AuditLog";

  await AuditLog.create({
    orderId: order.orderId,
    action: "STATUS_CHANGE",
    from: order.status,
    to: status,
    performedBy: "ADMIN",
  });

/* ================= CORE STATUS HANDLER ================= */
async function handleStatusChange(order, newStatus) {
  const now = new Date();

  /* ================= PAID ================= */
  if (newStatus === "PAID") {
    const { handleOrderPaid } = await import("@/lib/handleOrderPaid");

    try {
      await handleOrderPaid(order, { mode: "MANUAL" });
    } catch (err) {
      console.error("PAID handler failed:", err);
    }

    order.payment = {
      ...order.payment,
      paidAt: order.payment?.paidAt || now,
    };
  }

  /* ================= DISPATCHED ================= */
  if (newStatus === "DISPATCHED") {
    try {
      const { generateInvoiceHTML } = await import("@/lib/invoice");
      const { sendInvoiceEmail } = await import("@/lib/notifications/email");
      const { sendWhatsAppInvoice } = await import("@/lib/notifications/whatsapp");

      /* ================= GENERATE INVOICE ================= */
      if (!order.invoiceHTML) {
        order.invoiceHTML = generateInvoiceHTML(order.toObject());
      }

      /* ================= EMAIL (IDEMPOTENT) ================= */
      if (!order.invoiceSentAt) {
        await sendInvoiceEmail(order);
        order.invoiceSentAt = now;
      }

      /* ================= WHATSAPP (IDEMPOTENT) ================= */
      if (!order.whatsappInvoiceSentAt) {
        await sendWhatsAppInvoice(order);
        order.whatsappInvoiceSentAt = now;
      }

    } catch (err) {
      console.error("DISPATCHED handler error:", err);
    }

    order.dispatchedAt = order.dispatchedAt || now;
  }

  /* ================= OTHER STATUSES ================= */
  if (newStatus === "PACKED") order.packedAt = order.packedAt || now;
  if (newStatus === "OUT_FOR_DELIVERY") order.outForDeliveryAt = order.outForDeliveryAt || now;
  if (newStatus === "DELIVERED") order.deliveredAt = order.deliveredAt || now;
}

/* ================= API ROUTE ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const { id, status } = await req.json();

    /* ================= VALIDATION ================= */
    if (!id || !status) {
      return Response.json(
        { success: false, message: "Missing id or status" },
        { status: 400 }
      );
    }

    /* ================= FETCH ORDER ================= */
    const order = await Order.findById(id);

    if (!order) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* ================= IDEMPOTENCY ================= */
    if (order.status === status) {
      return Response.json({
        success: true,
        message: "Already updated",
        order,
      });
    }

    const previousStatus = order.status;

    /* ================= UPDATE STATUS ================= */
    order.status = status;

    /* ================= BUSINESS LOGIC ================= */
    await handleStatusChange(order, status);

    /* ================= SAVE ================= */
    await order.save();

    return Response.json({
      success: true,
      message: "Status updated successfully",
      previousStatus,
      order,
    });

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);

    return Response.json(
      {
        success: false,
        message: err.message || "Update failed",
      },
      { status: 500 }
    );
  }
}
