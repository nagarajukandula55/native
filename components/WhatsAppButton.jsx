"use client";

// Floating WhatsApp contact button, shown on every page. Reuses the same
// number already linked from the policy pages (refund/shipping/privacy),
// rather than inventing a new contact channel.
const WHATSAPP_NUMBER = "918985229693";
const DEFAULT_MESSAGE = "Hi Native, I have a question about ";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    DEFAULT_MESSAGE + (typeof window !== "undefined" ? window.location.href : "")
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="waBtn"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.9 0-2.65-1.03-5.13-2.9-7C17.17 3.03 14.7 2 12.04 2Zm0 18.12h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.25-4.34C3.8 7.4 7.5 3.7 12.04 3.7c2.2 0 4.26.86 5.82 2.42a8.15 8.15 0 0 1 2.4 5.79c0 4.53-3.7 8.21-8.22 8.21Zm4.5-6.15c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.16 1.73 2.65 4.2 3.71.59.25 1.04.4 1.4.51.59.19 1.12.16 1.55.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>

      <style jsx>{`
        .waBtn {
          position: fixed;
          bottom: 22px;
          right: 22px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25d366;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
          z-index: 100;
          transition: transform 160ms ease;
        }
        .waBtn:hover {
          transform: scale(1.06);
        }
      `}</style>
    </a>
  );
}
