"use client";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h3 style={headerTitle}>{title}</h3>
          <button style={closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

// Overlay gets its own horizontal padding so the modal never touches the
// viewport edge on narrow screens (was 0, so `width: 400` on the modal
// itself overflowed the viewport on any phone narrower than 400px + its
// own padding, forcing a horizontal scrollbar / clipped content).
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: 16,
  boxSizing: "border-box",
};

// `width: 400` with no cap meant the modal itself, not just the overlay,
// overflowed on mobile. Matches the input/button radius + spacing
// conventions used elsewhere (see app/checkout/page.tsx's `.card` /
// `input` styles: 16px+ border-radius, 20-30px padding).
const modal = {
  background: "#fff",
  padding: 24,
  borderRadius: 16,
  width: 400,
  maxWidth: "100%",
  boxSizing: "border-box",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

const headerTitle = {
  margin: 0,
  fontSize: 18,
  color: "#111827",
};

// Close button was unstyled (default browser button chrome: border, grey
// background, tiny hit target) -- inconsistent with every other button in
// the app (borderless, cursor: pointer -- see checkout page's .couponBtn/
// .payBtn) and not obviously clickable/aligned with the title.
const closeBtn = {
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: 1,
  color: "#64748b",
  padding: 4,
};
