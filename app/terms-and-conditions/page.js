import PolicyPage from "@/components/PolicyPage";

export const metadata = {
  title: "Terms & Conditions | Native",
  description: "The terms that govern your use of shopnative.in and orders placed with Native.",
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions" updated="July 2026">
      <p>
        These Terms & Conditions (&ldquo;Terms&rdquo;) govern your use of
        shopnative.in and any purchase made through it. By accessing the
        site or placing an order, you agree to these Terms.
      </p>

      <h2>About Native</h2>
      <p>
        Native sells natural, authentic food products directly and, where
        noted on a product or storefront page, on behalf of independent
        vendors who list and fulfill their own products through our
        marketplace (&ldquo;Vendors&rdquo;). Orders from a Vendor are
        subject to these Terms in addition to any vendor-specific
        information shown on their storefront.
      </p>

      <h2>Accounts</h2>
      <p>
        You&rsquo;re responsible for keeping your account credentials
        confidential and for all activity under your account. Provide
        accurate, current information when registering or checking out.
      </p>

      <h2>Orders & pricing</h2>
      <ul>
        <li>All prices are listed in Indian Rupees (₹) and include applicable GST unless stated otherwise.</li>
        <li>We reserve the right to correct pricing or listing errors and to cancel affected orders, with a full refund if payment was already collected.</li>
        <li>An order is confirmed only once payment is successfully processed and you receive an order confirmation.</li>
        <li>We reserve the right to limit order quantities or refuse an order at our discretion (for example, suspected fraud or reseller activity).</li>
      </ul>

      <h2>Payments</h2>
      <p>
        Payments are processed securely through Razorpay (cards, UPI, net
        banking, wallets) or via Cash on Delivery where offered. We do not
        store your card or bank details.
      </p>

      <h2>Shipping & delivery</h2>
      <p>
        See our <a href="/shipping-policy">Shipping Policy</a> for delivery
        timelines, charges, and how to track your order.
      </p>

      <h2>Cancellations, returns & refunds</h2>
      <p>
        See our <a href="/refund-policy">Refund & Cancellation Policy</a>{" "}
        for full details on how to cancel an order or request a return.
      </p>

      <h2>Vendor marketplace</h2>
      <p>
        Where a product is sold by a Vendor rather than Native directly,
        Native facilitates the listing, payment, and order routing, but the
        Vendor is responsible for the accuracy of their product
        descriptions and for fulfilling the order. Native reviews and can
        suspend Vendors who don&rsquo;t meet our quality and service
        standards.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on this site — logos, product photography, text, and
        design — belongs to Native or its licensors and may not be
        reproduced without permission.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, Native is not liable for indirect
        or consequential losses arising from use of the site or products
        purchased, beyond the value of the order in question.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of India, and any disputes
        are subject to the exclusive jurisdiction of the courts where
        Native is registered.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:care@shopnative.in">care@shopnative.in</a>.
      </p>
    </PolicyPage>
  );
}
