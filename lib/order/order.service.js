import mongoose from "mongoose";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import { mapProductToOrderItem } from "./order.mapper";
import { createOrderInDB } from "./order.repository";
import { generateOrderId } from "@/lib/orderId";

const round = (n) => Math.round(n * 100) / 100;

export async function createOrderService(data) {
  let subtotal = 0;
  const items = [];

  for (const item of data.cart) {
    let product = null;

    if (mongoose.Types.ObjectId.isValid(item.productId)) {
      product = await Product.findById(item.productId).lean();
    }

    if (!product) {
      product = await Product.findOne({
        productKey: item.productId,
      }).lean();
    }

    if (!product) continue;

    const mapped = mapProductToOrderItem(product, item.qty);

    subtotal += mapped.baseAmount;
    items.push(mapped);
  }

  if (!items.length) {
    throw new Error("No valid products");
  }

  /* ================= COUPON ================= */
  let discount = 0;

  if (data.coupon) {
    const c = await Coupon.findOne({
      code: data.coupon.toUpperCase(),
      active: true,
    });

    if (c && subtotal >= (c.minCartValue || 0)) {
      discount =
        c.type === "percent"
          ? (subtotal * c.value) / 100
          : c.value;
    }
  }

  const discountRatio = subtotal ? discount / subtotal : 0;

  let totalTaxable = 0;
  let totalGST = 0;

  for (const item of items) {
    const taxable = item.baseAmount - item.baseAmount * discountRatio;
    const gst = (taxable * item.gstPercent) / 100;

    item.total = round(taxable + gst);

    totalTaxable += taxable;
    totalGST += gst;
  }

  const finalAmount = round(totalTaxable + totalGST);

  const orderId = await generateOrderId();

  return await createOrderInDB({
    orderId,
    items,
    amount: finalAmount,
    address: data.address,
    paymentMethod: data.paymentMethod,
  });
}
