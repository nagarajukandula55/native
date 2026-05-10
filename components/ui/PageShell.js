export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "auto" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>{subtitle}</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {actions}
        </div>
      </div>

      {/* CONTENT */}
      <div className="card" style={{ padding: 16 }}>
        {children}
      </div>

    </div>
  );
}
