import PolicyPage from "@/components/PolicyPage";

export const metadata = {
  title: "Refund & Cancellation Policy | Native",
  description: "How to cancel an order, request a return, or get a refund from Native.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refund & Cancellation Policy" updated="July 2026">
      <p>
        We want you to be happy with every order. This policy explains how
        cancellations, returns, and refunds work for orders placed on
        shopnative.in.
      </p>

      <h2>Cancelling an order</h2>
      <ul>
        <li>Orders can be cancelled free of charge any time before they&rsquo;re shipped, from your <a href="/orders">My Orders</a> page or by contacting support.</li>
        <li>Once an order has shipped, it can no longer be cancelled — you can request a return instead once it&rsquo;s delivered.</li>
      </ul>

      <h2>Returns</h2>
      <p>
        Because most of our products are food items, returns are handled
        carefully to protect quality and safety:
      </p>
      <ul>
        <li>Damaged, defective, or incorrect items: report within 48 hours of delivery with a photo, and we&rsquo;ll arrange a replacement or full refund at no cost to you.</li>
        <li>Unopened, sealed, non-perishable items: eligible for return within 7 days of delivery in original packaging.</li>
        <li>Opened food items, perishables, and made-to-order products are not eligible for return unless defective, for safety and hygiene reasons.</li>
      </ul>

      <h2>How to request a return or refund</h2>
      <p>
        Email <a href="mailto:care@shopnative.in">care@shopnative.in</a> or
        WhatsApp{" "}
        <a href="https://wa.me/918985229693" target="_blank" rel="noreferrer">
          +91 89852 29693
        </a>{" "}
        with your order ID and the reason for the request. We&rsquo;ll
        confirm eligibility and next steps within 24-48 hours.
      </p>

      <h2>Refund timelines</h2>
      <ul>
        <li>Once a return/refund is approved, refunds to the original payment method are initiated within 3-5 business days.</li>
        <li>Depending on your bank or payment provider, it may take a further 5-7 business days to reflect in your account.</li>
        <li>Cash on Delivery orders are refunded via bank transfer or UPI to details you provide.</li>
      </ul>

      <h2>Vendor-fulfilled orders</h2>
      <p>
        For products sold by a Vendor on Native&rsquo;s marketplace, the
        same timelines apply; Native coordinates the return/refund with the
        Vendor on your behalf so you only need to contact Native support.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about a specific order? Reach us at{" "}
        <a href="mailto:care@shopnative.in">care@shopnative.in</a> — please
        include your order ID.
      </p>
    </PolicyPage>
  );
}
