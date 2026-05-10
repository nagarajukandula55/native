export function isInterState(companyState, customerState) {
  return (
    String(companyState).trim().toLowerCase() !==
    String(customerState).trim().toLowerCase()
  );
}

export function calculateGSTSummary(order, companyState) {

  const interState = isInterState(
    companyState,
    order.address?.state
  );

  let taxable = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  for (const item of order.items || []) {

    taxable += Number(item.taxableAmount || 0);

    if (interState) {
      igst += Number(item.igst || 0);
    } else {
      cgst += Number(item.cgst || 0);
      sgst += Number(item.sgst || 0);
    }
  }

  return {
    interState,
    taxable,
    cgst,
    sgst,
    igst,
    totalGST: cgst + sgst + igst,
  };
}
