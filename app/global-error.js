"use client";

/**
 * Catches errors thrown in the root layout itself (rare, but if it
 * happens this is the only boundary that can catch it — Next.js requires
 * global-error.js to render its own <html>/<body>).
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "#faf8f3",
          }}
        >
          <div
            style={{
              maxWidth: 440,
              textAlign: "center",
              background: "#fff",
              borderRadius: 14,
              padding: 40,
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
            }}
          >
            <h1 style={{ margin: "0 0 10px", fontSize: 22 }}>
              Native is temporarily unavailable
            </h1>
            <p style={{ color: "#666", margin: "0 0 24px" }}>
              Something went wrong loading the site. Please try again in a
              moment.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "12px 24px",
                background: "#c28b45",
                color: "#fff",
                border: "none",
                borderRadius: 30,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
