import fs from "fs";
import path from "path";

export const buildInvoiceHTML = (data) => {
  let html = fs.readFileSync(
    path.join(process.cwd(), "lib/invoice/template.html"),
    "utf8"
  );

  const itemsHTML = data.items
    .map(
      (it) => `
      <tr>
        <td>${it.name}</td>
        <td>${it.hsn}</td>
        <td>${it.qty}</td>
        <td>${it.rate}</td>
        <td>${it.gstPercent}%</td>
        <td class="right">${it.total}</td>
      </tr>
    `
    )
    .join("");

  return html
    .replace("{{companyName}}", data.companyName)
    .replace("{{gstin}}", data.gstin)
    .replace("{{invoiceNumber}}", data.invoiceNumber)
    .replace("{{customerName}}", data.customer.name)
    .replace("{{phone}}", data.customer.phone)
    .replace("{{address}}", data.customer.address)
    .replace("{{customerGST}}", data.customer.gst || "-")
    .replace("{{items}}", itemsHTML)
    .replace("{{subtotal}}", data.subtotal)
    .replace("{{cgst}}", data.cgst)
    .replace("{{sgst}}", data.sgst)
    .replace("{{igst}}", data.igst)
    .replace("{{grandTotal}}", data.grandTotal);
};
