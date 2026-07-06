import PolicyPage from "@/components/PolicyPage";

export const metadata = {
  title: "Privacy Policy | Native",
  description: "How Native collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" updated="July 2026">
      <p>
        This Privacy Policy explains how Native (&ldquo;Native&rdquo;,
        &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) collects, uses,
        shares, and protects information when you visit shopnative.in or
        place an order with us. By using this site, you agree to the
        practices described below.
      </p>

      <h2>Information we collect</h2>
      <p>When you browse, register, or order with us, we may collect:</p>
      <ul>
        <li>Contact details you provide — name, email, phone number, delivery address.</li>
        <li>Account information — login credentials (passwords are stored securely, never in plain text) and order history.</li>
        <li>Payment information — processed directly by our payment partner (Razorpay); we do not store your card, UPI, or bank details ourselves.</li>
        <li>Usage data — pages visited, products viewed, and device/browser information, collected via cookies and analytics tools (Google Analytics).</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To process and deliver your orders, including sharing your name, phone, and address with our logistics partner (Shiprocket) for shipping.</li>
        <li>To send order updates via email, SMS, or WhatsApp.</li>
        <li>To respond to support requests and resolve disputes.</li>
        <li>To improve our site, product range, and marketing based on aggregated usage trends.</li>
        <li>To meet legal, tax (GST), and regulatory obligations.</li>
      </ul>

      <h2>Sharing your information</h2>
      <p>
        We share information only with service providers who help us run
        Native — payment processing (Razorpay), shipping and logistics
        (Shiprocket), image hosting, email/SMS/WhatsApp notifications, and
        analytics — each bound to use your data only to provide that
        service. If you buy from a vendor selling on Native&rsquo;s
        marketplace, the relevant order details are shared with that vendor
        solely to fulfill your order. We do not sell your personal
        information to third parties.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies and similar technologies to keep you signed in,
        remember your cart, and understand how the site is used. You can
        control cookies through your browser settings; disabling them may
        affect parts of the site (like staying logged in).
      </p>

      <h2>Your rights</h2>
      <p>
        You can request access to, correction of, or deletion of your
        personal data by writing to us at{" "}
        <a href="mailto:care@shopnative.in">care@shopnative.in</a>. You can
        also update most account details directly from your profile page.
      </p>

      <h2>Data security</h2>
      <p>
        We use industry-standard measures — encrypted connections, hashed
        passwords, and restricted access — to protect your information.
        No method of transmission or storage is 100% secure, and we
        encourage you to use a strong, unique password for your account.
      </p>

      <h2>Children&rsquo;s privacy</h2>
      <p>
        Native is not directed at children under 18. We do not knowingly
        collect personal information from children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material
        changes will be reflected by updating the &ldquo;last updated&rdquo;
        date above.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about this policy? Email{" "}
        <a href="mailto:care@shopnative.in">care@shopnative.in</a> or
        WhatsApp us at{" "}
        <a href="https://wa.me/918985229693" target="_blank" rel="noreferrer">
          +91 89852 29693
        </a>
        .
      </p>
    </PolicyPage>
  );
}
