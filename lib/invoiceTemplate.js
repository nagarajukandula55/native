export const buildInvoiceHTML = ({ order, company }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #111827;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #eee;
      padding-bottom: 20px;
    }

    .title {
      font-size: 24px;
      font-weight: bold;
    }

    .section {
      margin-top: 20px;
    }

    .box {
      background: #f9fafb;
      padding: 15px;
      border-radius: 10px;
      margin-top: 10px;
    }

    table {
      width: 100%;
      margin-top: 20px;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
      font-size: 12px;
    }

    .total {
      text-align: right;
      font-size: 16px;
      font-weight: bold;
      margin-top: 20px;
    }

    .brand {
      font-size: 18px;
      font-weight: bold;
    }

    .muted {
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>

<body>

  <div class="header">
    <div>
      <div class="brand">${company?.companyName || "Native"}</div>
      <div class="muted">${company?.brandTagline || ""}</div>
    </div>

    <div class="title">INVOICE</div>
  </div>

  <div class="section">
    <h3>Bill To</h3>
    <div class="box">
      ${order.address?.name}<br/>
      ${order.address?.phone}<br/>
      ${order.address?.address}<br/>
      ${order.address?.city} - ${order.address?.pincode}
    </div>
  </div>

  <div class="section">
    <h3>Order Details</h3>
    <div class="box">
      Order ID: ${order.orderId}<br/>
      Date: ${new Date(order.createdAt).toLocaleString()}<br/>
      Payment: ${order.payment?.method}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>₹${item.total}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="total">
    Grand Total: ₹${order.billing?.grandTotal}
  </div>

</body>
</html>
`;
};
