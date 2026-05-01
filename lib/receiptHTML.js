export function generateReceiptHTML(order, company) {
  return `
  <html>
  <head>
    <style>
      body { font-family: Arial; padding: 20px; }
      .header { text-align: center; }
      .box { border: 1px solid #ddd; padding: 15px; margin-top: 10px; }
      .row { display: flex; justify-content: space-between; margin: 5px 0; }
      .total { font-size: 18px; font-weight: bold; }
    </style>
  </head>

  <body>

    <div class="header">
      <img src="${company.logoUrl}" width="120" />
      <h2>${company.companyName}</h2>
      <p>PAYMENT RECEIPT</p>
    </div>

    <div class="box">
      <div class="row">
        <span>Receipt No:</span>
        <b>${order.receipt.receiptNumber}</b>
      </div>

      <div class="row">
        <span>Order ID:</span>
        <b>${order.orderId}</b>
      </div>

      <div class="row">
        <span>Date:</span>
        <b>${new Date().toLocaleString()}</b>
      </div>

      <div class="row">
        <span>Payment Method:</span>
        <b>${order.receipt.paymentMode}</b>
      </div>

      <div class="row">
        <span>Payment Ref:</span>
        <b>${order.receipt.paymentReference || "N/A"}</b>
      </div>
    </div>

    <div class="box">
      <h3>Customer</h3>
      <p>${order.address.name}</p>
      <p>${order.address.phone}</p>
      <p>${order.address.address}</p>
    </div>

    <div class="box">
      <div class="row total">
        <span>Total Paid</span>
        <span>₹${order.amount}</span>
      </div>
    </div>

  </body>
  </html>
  `;
}
