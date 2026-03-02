"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! Your message has been sent."); // can later integrate backend
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div style={{ padding: "80px 60px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>Contact Us</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "500px" }}
      >
        <input
          name="name"
          placeholder="Full Name"
          required
          value={formData.name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Your Message"
          required
          value={formData.message}
          onChange={handleChange}
        />
        <button
          type="submit"
          style={{
            padding: "12px 30px",
            borderRadius: "25px",
            border: "none",
            backgroundColor: "#c28b45",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
