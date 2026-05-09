export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import Company from "@/models/CompanySettings";

import generateInvoiceNumber from "@/lib/generateInvoiceNumber";
import generateReceiptNumber from "@/lib/generateReceiptNumber";

import {
  sendTelegramMessage,
} from "@/lib/telegram";

import {

  sendInvoiceEmail,

  sendPackedEmail,

  sendDispatchedEmail,

  sendDeliveredEmail,

} from "@/lib/email";

import {
  createShiprocketShipment,
  assignAWB,
  generateLabel,
  schedulePickup,
} from "@/lib/shiprocket";

/* =========================================
   UPDATE STATUS
========================================= */

export async function POST(req) {

  try {

    await dbConnect();

    const body =
      await req.json();

    const {

      id,

      status,

      dispatchType,

      courierId,

      trackingId,

    } = body;

    /* =========================================
       VALIDATION
    ========================================= */

    if (!id || !status) {

      return NextResponse.json(
        {
          success: false,
          message:
            "ID & status required",
        },
        { status: 400 }
      );
    }

    /* =========================================
       FIND ORDER
    ========================================= */

    const order =
      await Order.findById(id);

    if (!order) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Order not found",
        },
        { status: 404 }
      );
    }

    const previousStatus =
      order.status;

    /* =========================================
       STATUS TIMELINE
    ========================================= */

    const now =
      new Date();

    /* =========================================
       PAID
    ========================================= */

    if (
      status === "PAID"
    ) {

      order.status =
        "PAID";

      order.statusTimeline.paidAt =
        now;

      if (
        !order.receipt
          ?.receiptNumber
      ) {

        const receiptNumber =
          await generateReceiptNumber(
            Company,
            Order
          );

        order.receipt = {

          receiptNumber,

          generatedAt:
            now,

          amountPaid:
            order.amount,

          paymentMode:
            order.payment
              ?.method,

          receiptUrl:
            `/receipt/${order.orderId}`,
        };
      }

      await sendTelegramMessage(`

💰 ORDER MARKED PAID

🧾 ${order.orderId}

👤 ${order.address?.name}

💵 ₹${order.amount}

      `);
    }

    /* =========================================
       PROCESSING
    ========================================= */

    if (
      status ===
      "PROCESSING"
    ) {

      order.status =
        "PROCESSING";

      order.statusTimeline.processedAt =
        now;

      order.warehouse.status =
        "PICKING";

      await sendTelegramMessage(`

📦 ORDER PROCESSING

🧾 ${order.orderId}

👤 ${order.address?.name}

      `);
    }

    /* =========================================
       PACKED
    ========================================= */

    if (
      status === "PACKED"
    ) {

      order.status =
        "PACKED";

      order.statusTimeline.packedAt =
        now;

      order.warehouse.status =
        "PACKED";

      order.warehouse.packedAt =
        now;

      /* =====================================
         GENERATE INVOICE
      ===================================== */

      if (
        !order.invoice
          ?.invoiceNumber
      ) {

        const invoiceNumber =
          await generateInvoiceNumber(
            Company,
            Order
          );

        order.invoice = {

          invoiceNumber,

          generatedAt:
            now,

          invoiceUrl:
            `/invoice/${order.orderId}`,

          billingSnapshot:
            order.billing,
        };
      }

      /* =====================================
         EMAIL
      ===================================== */

      try {

        if (
          order.address?.email
        ) {

          await sendPackedEmail({

            to:
              order.address.email,

            order,
          });

          await sendInvoiceEmail({

            to:
              order.address.email,

            order,
          });
        }

      } catch (mailErr) {

        console.log(
          "PACKED MAIL ERROR:",
          mailErr
        );
      }

      await sendTelegramMessage(`

📦 ORDER PACKED

🧾 ${order.orderId}

👤 ${order.address?.name}

      `);
    }

    /* =========================================
       DISPATCHED
    ========================================= */

    if (
      status ===
      "DISPATCHED"
    ) {

      order.status =
        "DISPATCHED";

      order.statusTimeline.dispatchedAt =
        now;

      order.warehouse.status =
        "DISPATCHED";

      order.warehouse.dispatchedAt =
        now;

      /* =====================================
         SHIPPING MODE
      ===================================== */

      if (
        dispatchType ===
        "BY_HAND"
      ) {

        order.shipping = {

          ...order.shipping,

          dispatchType:
            "BY_HAND",

          trackingStatus:
            "HAND_DELIVERY",
        };
      }

      /* =====================================
         COURIER FLOW
      ===================================== */

      else {

        const shipment =
          await createShiprocketShipment(
            order
          );

        const shipmentId =

          shipment
            ?.shipment_id ||

          shipment
            ?.shipment_details
              ?.shipment_id;

        let awbData = {};

        if (
          courierId
        ) {

          awbData =
            await assignAWB(
              shipmentId,
              courierId
            );
        }

        const awb =

          awbData?.response
            ?.data
            ?.awb_code ||

          trackingId ||

          "";

        const courierName =

          awbData?.response
            ?.data
            ?.courier_name ||

          "Shiprocket";

        const label =
          await generateLabel(
            shipmentId
          );

        await schedulePickup(
          shipmentId
        );

        order.shipping = {

          ...order.shipping,

          dispatchType:
            "COURIER",

          shipmentId:
            String(
              shipmentId
            ),

          awbNumber:
            awb,

          courierPartner:
            courierName,

          labelUrl:

            label
              ?.label_url ||

            label?.response
              ?.label_url ||

            "",

          pickupScheduled:
            true,

          pickupAt:
            now,

          trackingStatus:
            "AWB_GENERATED",
        };
      }

      /* =====================================
         EMAIL
      ===================================== */

      try {

        if (
          order.address?.email
        ) {

          await sendDispatchedEmail({

            to:
              order.address.email,

            order,
          });
        }

      } catch (mailErr) {

        console.log(
          "DISPATCH EMAIL ERROR:",
          mailErr
        );
      }

      await sendTelegramMessage(`

🚚 ORDER DISPATCHED

🧾 ${order.orderId}

👤 ${order.address?.name}

📦 AWB:
${order.shipping?.awbNumber || "-"}

🚛 Courier:
${order.shipping?.courierPartner || "-"}

      `);
    }

    /* =========================================
       DELIVERED
    ========================================= */

    if (
      status ===
      "DELIVERED"
    ) {

      order.status =
        "DELIVERED";

      order.statusTimeline.deliveredAt =
        now;

      order.warehouse.status =
        "DELIVERED";

      order.shipping.deliveredAt =
        now;

      try {

        if (
          order.address?.email
        ) {

          await sendDeliveredEmail({

            to:
              order.address.email,

            order,
          });
        }

      } catch (mailErr) {

        console.log(
          "DELIVERED MAIL ERROR:",
          mailErr
        );
      }

      await sendTelegramMessage(`

✅ ORDER DELIVERED

🧾 ${order.orderId}

👤 ${order.address?.name}

      `);
    }

    /* =========================================
       AUDIT
    ========================================= */

    order.auditLogs.push({

      action:
        "STATUS_UPDATED",

      from:
        previousStatus,

      to:
        status,

      by:
        "ADMIN",

      meta: {

        dispatchType,

        courierId,
      },

      at:
        now,
    });

    /* =========================================
       SAVE
    ========================================= */

    await order.save();

    /* =========================================
       RESPONSE
    ========================================= */

    return NextResponse.json({

      success: true,

      orderId:
        order.orderId,

      status:
        order.status,

      shipping:
        order.shipping,
    });

  } catch (err) {

    console.log(
      "UPDATE STATUS ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,

        message:
          err.message ||
          "Update failed",
      },
      { status: 500 }
    );
  }
}
