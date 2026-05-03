"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.message) {
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        alert(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1>Contact Us</h1>
        <p>We usually respond within 24 hours.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="name"
            placeholder="Your Name *"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="phone"
            placeholder="Phone *"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
          />

          <textarea
            name="message"
            placeholder="Your Message *"
            value={form.message}
            onChange={handleChange}
            style={styles.textarea}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>

          {success && (
            <p style={{ color: "green", marginTop: 10 }}>
              ✅ Message sent successfully!
            </p>
          )}
        </form>

        <div style={styles.info}>
          <p>📍 Chennai, Tamil Nadu</p>
          <p>📞 +91 90000 00000</p>
          <p>📧 support@shopnative.in</p>
          <p>💬 WhatsApp: Click below</p>

          <a
            href="https://wa.me/919000000000"
            target="_blank"
            style={styles.whatsapp}
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    background: "#f7f7f7",
    minHeight: "100vh",
  },
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    width: "100%",
    maxWidth: 600,
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 20,
  },
  input: {
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 6,
  },
  textarea: {
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 6,
    minHeight: 120,
  },
  button: {
    padding: 12,
    background: "black",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  info: {
    marginTop: 25,
    fontSize: 14,
    color: "#444",
  },
  whatsapp: {
    display: "inline-block",
    marginTop: 10,
    background: "#25D366",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: 6,
    textDecoration: "none",
  },
};
