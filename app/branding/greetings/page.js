"use client";

import { useEffect, useState } from "react";

export default function GreetingsPage() {
  const [greetings, setGreetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGreetings = async () => {
    const res = await fetch("/api/branding/greetings");
    const data = await res.json();
    if (data.success) setGreetings(data.greetings);
    setLoading(false);
  };

  const deleteGreeting = async (id) => {
    if (!confirm("Delete this greeting?")) return;
    await fetch("/api/branding/greetings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchGreetings();
  };

  useEffect(() => { fetchGreetings(); }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Greetings / Social Posts</h1>
      <a href="/branding/greetings/create" style={{ marginBottom: 10, display: "inline-block", color: "#2563eb" }}>+ Create Greeting</a>

      {greetings.map((g) => (
        <div key={g._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
          <h3>{g.title}</h3>
          <p>{g.message}</p>
          <p>Platform: {g.platform}</p>
          {g.imageUrl && <img src={g.imageUrl} alt="img" width={120} />}
          <button onClick={() => deleteGreeting(g._id)} style={{ color: "red", marginRight: 10 }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
