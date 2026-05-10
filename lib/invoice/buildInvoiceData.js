export const buildInvoiceData = (order) => {
  if (!order) throw new Error("Order missing");

  const isB2B = !!order.address?.gstNumber;

  let subtotal = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  const items = order.items.map((item) => {
    if (!item.snapshot?.hsn) {
      throw new Error(`HSN missing for ${item.name}`);
    }

    const rate = Number(item.price || 0);
    const qty = Number(item.qty || 0);
    const gstPercent = Number(item.gstPercent || 0);

    const base = rate * qty;
    const gstAmount = (base * gstPercent) / 100;

    let itemCGST = 0;
    let itemSGST = 0;
    let itemIGST = 0;

    if (isB2B) {
      itemCGST = gstAmount / 2;
      itemSGST = gstAmount / 2;
    } else {
      itemCGST = 0;
      itemSGST = 0;
    }

    subtotal += base;
    cgst += itemCGST;
    sgst += itemSGST;
    igst += itemIGST;

    return {
      name: item.name,
      hsn: item.snapshot.hsn,
      qty,
      rate,
      gstPercent,
      base,
      cgst: itemCGST,
      sgst: itemSGST,
      igst: itemIGST,
      total: base + gstAmount,
    };
  });

  const grandTotal = subtotal + cgst + sgst + igst;

  return {
    isB2B,
    items,
    subtotal,
    cgst,
    sgst,
    igst,
    grandTotal,
    order,
  };
};
