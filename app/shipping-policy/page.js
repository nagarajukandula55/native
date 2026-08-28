import PolicyPage from "@/components/PolicyPage";

export const metadata = {
  title: "Shipping Policy | Native",
  description: "Delivery timelines, charges, and order tracking for Native.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping Policy" updated="July 2026">
      <p>
        We ship across India through our logistics partner, Shiprocket,
        working with a network of trusted courier partners to get orders
        to you quickly and safely.
      </p>

      <h2>Processing time</h2>
      <p>
        Orders are typically packed and handed to our courier partner
        within 1-2 business days of confirmation. You&rsquo;ll receive a
        notification with tracking details as soon as your order ships.
      </p>

      <h2>Delivery timelines</h2>
      <ul>
        <li>Metro cities: 2-4 business days after dispatch.</li>
        <li>Other cities and towns: 4-7 business days after dispatch.</li>
        <li>Remote or restricted pincodes: may take longer, and in rare cases a pincode may not be serviceable — we&rsquo;ll let you know at checkout if that&rsquo;s the case.</li>
      </ul>
      <p>
        These are estimates, not guarantees — weather, courier delays, and
        local restrictions can occasionally affect delivery times.
      </p>

      <h2>Shipping charges</h2>
      <p>
        Shipping charges (if any) are calculated at checkout based on your
        delivery location and order value, and shown before you pay.
        We periodically run free-shipping promotions above a minimum order
        value — any active offer will be shown on the cart page.
      </p>

      <h2>Tracking your order</h2>
      <p>
        Track any order from the <a href="/track">Track Order</a> page
        using your order ID, or from{" "}
        <a href="/orders">My Orders</a> if you&rsquo;re signed in.
      </p>

      <h2>Vendor-fulfilled orders</h2>
      <p>
        Some products are shipped directly by the Vendor selling them
        rather than from Native&rsquo;s own warehouse — in that case
        delivery timelines may vary slightly and will be shown on the
        product page where applicable.
      </p>

      <h2>Delivery issues</h2>
      <p>
        If your order is delayed well beyond the estimate above, arrives
        damaged, or shows as delivered but didn&rsquo;t reach you, contact{" "}
        <a href="mailto:connectwitnative@gmail.com">connectwitnative@gmail.com</a> with
        your order ID and we&rsquo;ll investigate with our courier partner.
      </p>
    </PolicyPage>
  );
}
