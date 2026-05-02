import puppeteer from "puppeteer";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const order = await Order.findOne({ orderId: params.id }).lean();

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    /* ================= HTML TEMPLATE ================= */
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial;
              padding: 30px;
              color: #111;
            }

            .invoice {
              max-width: 800px;
              margin: auto;
            }

            .header {
              text-align: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }

            .logo {
              width: 100px;
            }

            .tagline {
              font-size: 12px;
              color: #777;
              margin-top: 5px;
            }

            .title {
              font-size: 20px;
              font-weight: bold;
              margin-top: 5px;
            }

            .section {
              margin-top: 15px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }

            .box {
              width: 48%;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              padding: 10px;
              border-bottom: 1px solid #eee;
              font-size: 13px;
            }

            .summary {
              text-align: right;
              margin-top: 15px;
            }

            .total {
              font-size: 18px;
              font-weight: bold;
            }

            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: gray;
            }
          </style>
        </head>

        <body>
          <div class="invoice">

            <div class="header">
              <img src="https://yourdomain.com/logo.png" class="logo"/>
              <div class="tagline">Fast • Reliable • Trusted Service</div>
              <div class="title">PAYMENT RECEIPT</div>
            </div>

            <div class="section">
              <p><b>Order ID:</b> ${order.orderId}</p>
              <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div class="row">
              <div class="box">
                <h4>Customer</h4>
                <p>${order.address?.name || ""}</p>
                <p>${order.address?.phone || ""}</p>
                <p>${order.address?.address || ""}</p>
              </div>

              <div class="box">
                <h4>Payment</h4>
                <p>Mode: ${order.payment?.method || "ONLINE"}</p>
                <p>Ref: ${order.payment?.razorpay_payment_id || "N/A"}</p>
                <p>Receipt: ${order.receipt?.receiptNumber || "N/A"}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (i) => `
                  <tr>
                    <td>${i.name}</td>
                    <td>${i.qty}</td>
                    <td>₹${i.price}</td>
                    <td>₹${i.price * i.qty}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="summary">
              <p>Subtotal: ₹${order.amount}</p>
              <div class="total">Total Paid: ₹${order.amount}</div>
            </div>

            <div class="footer">
              Thank you for your purchase ❤️
            </div>

          </div>
        </body>
      </html>
    `;

    /* ================= PDF GENERATION ================= */
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=receipt-${order.orderId}.pdf`,
      },
    });

  } catch (err) {
    console.error(err);
    return new Response("PDF generation failed", { status: 500 });
  }
}
