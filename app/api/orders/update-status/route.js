import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import AuditLog from "@/models/AuditLog";

/* ================= CORE STATUS HANDLER ================= */
async function handleStatusChange(order, newStatus) {
  const now = new Date();

  /* ================= PAID ================= */
  if (newStatus === "PAID") {
    try {
      const { handleOrderPaid } = await import("@/lib/handleOrderPaid");
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

      const freshOrder = order.toObject(); // safer snapshot

      if (!order.invoiceHTML) {
        order.invoiceHTML = generateInvoiceHTML(freshOrder);
      }

      if (!order.invoiceSentAt) {
        await sendInvoiceEmail(order);
        order.invoiceSentAt = now;
      }

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
  const statusTimeMap = {
    PACKED: "packedAt",
    OUT_FOR_DELIVERY: "outForDeliveryAt",
    DELIVERED: "deliveredAt",
  };

  if (statusTimeMap[newStatus]) {
    order[statusTimeMap[newStatus]] =
      order[statusTimeMap[newStatus]] || now;
  }
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

    order.status = status;

    /* ================= BUSINESS LOGIC ================= */
    await handleStatusChange(order, status);

    /* ================= SAVE FIRST (IMPORTANT FIX) ================= */
    await order.save();

    /* ================= AUDIT LOG (SAFE) ================= */
    await AuditLog.create({
      orderId: order.orderId,
      action: "STATUS_CHANGE",
      from: previousStatus,
      to: status,
      performedBy: "ADMIN",
    });

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
