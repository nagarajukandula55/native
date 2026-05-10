export const buildReceiptData = (order) => {
  if (!order) throw new Error("Order missing");

  if (!order.payment || order.payment.status !== "SUCCESS") {
    throw new Error("Receipt only allowed for successful payments");
  }

  const amountPaid =
    Number(order.payment.amountPaid || order.billing?.grandTotal || order.amount);

  return {
    orderId: order.orderId,
    customer: order.address,
    payment: order.payment,
    amountPaid,
    method: order.payment.method,
    transactionId:
      order.payment.razorpay_payment_id ||
      order.payment.transactionId ||
      order.payment.utr ||
      "N/A",
    paidAt: order.payment.paidAt || order.updatedAt,
  };
};
