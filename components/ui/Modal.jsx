"use client";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  width: 400,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10,
};
