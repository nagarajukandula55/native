// lib/invoice/invoice.helpers.js

export const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

export const line = (pdf, y, color = "#d1d5db") => {
  pdf.strokeColor(color).lineWidth(1).moveTo(40, y).lineTo(555, y).stroke();
};

export const checkPage = (pdf, y) => {
  if (y > 700) {
    pdf.addPage();
    return 60;
  }
  return y;
};

export const getPDFBuffer = (pdf, chunks) =>
  new Promise((resolve) => {
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.end();
  });
