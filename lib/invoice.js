export const generateInvoiceHTML = (order) => {
  const isB2B = !!order.gstNumber;

  const {
    address = {},
    items = [],
    gstSummary = {},
    gstMode,
  } = order;

  const {
    subtotal = 0,
    cgstTotal = 0,
    sgstTotal = 0,
    igstTotal = 0,
    discount = 0,
  } = gstSummary;

  const total = order.amount || 0;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN");

  return `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        color: #222;
      }

      h1, h2, h3 {
        margin: 0;
      }

      .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .box {
        margin-bottom: 15px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }

      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        font-size: 14px;
      }

      th {
        background: #f5f5f5;
      }

      .right {
        text-align: right;
      }

      .total {
        font-weight: bold;
        font-size: 16px;
      }

      .footer {
        margin-top: 30px;
        font-size: 13px;
      }
    </style>
  </head>

  <body>

    <!-- HEADER -->
    <div class="header">
      <div>
        <h2>TAX INVOICE</h2>
        <p><b>Order ID:</b> ${order.orderId}</p>
        <p><b>Date:</b> ${formatDate(order.createdAt)}</p>
      </div>

      <div>
        <h3>Native</h3>
        <p>GSTIN: YOUR_GST_NUMBER</p>
        <p>State: Andhra Pradesh</p>
      </div>
    </div>

    <!-- CUSTOMER -->
    <div class="box">
      <h4>Bill To:</h4>
      <p>
        ${address.name || ""}<br/>
        ${address.address || ""}<br/>
        ${address.city || ""} - ${address.pincode || ""}<br/>
        ${address.state || ""}
      </p>

      ${
        isB2B
          ? `
          <p><b>GSTIN:</b> ${order.gstNumber}</p>
          <p><b>Invoice Type:</b> B2B</p>
        `
          : `<p><b>Invoice Type:</b> B2C</p>`
      }
    </div>

    <!-- ITEMS -->
    <table>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th>HSN</th>
        <th>Qty</th>
        <th>Price</th>
        <th>GST%</th>
        <th>Total</th>
      </tr>

      ${items
        .map(
          (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.name}</td>
          <td>${item.hsn || "-"}</td>
          <td>${item.qty}</td>
          <td class="right">₹${item.price}</td>
          <td>${item.gstPercent || 0}%</td>
          <td class="right">₹${item.price * item.qty}</td>
        </tr>
      `
        )
        .join("")}
    </table>

    <!-- TOTALS -->
    <table>
      <tr>
        <td>Subtotal</td>
        <td class="right">₹${subtotal}</td>
      </tr>

      ${
        gstMode === "CGST_SGST"
          ? `
        <tr><td>CGST</td><td class="right">₹${cgstTotal}</td></tr>
        <tr><td>SGST</td><td class="right">₹${sgstTotal}</td></tr>
      `
          : `
        <tr><td>IGST</td><td class="right">₹${igstTotal}</td></tr>
      `
      }

      <tr>
        <td>Discount</td>
        <td class="right">₹${discount}</td>
      </tr>

      <tr class="total">
        <td>Total</td>
        <td class="right">₹${total}</td>
      </tr>
    </table>

    <!-- FOOTER -->
    <div class="footer">
      <p><b>Declaration:</b></p>
      <p>
        We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
      </p>

      <br/><br/>
      <p>Authorized Signatory</p>
    </div>

  </body>
  </html>
  `;
};
