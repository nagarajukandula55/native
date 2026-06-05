export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "South Indian Breakfast Thali – A Complete Morning Feast",
      date: "2026-03-01",
      image:
        "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "Idli, dosa, vada, sambar, chutney — a healthy traditional South Indian breakfast rich in taste and nutrition.",
    },
    {
      id: 2,
      title: "Poha – India’s Light & Healthy Breakfast",
      date: "2026-02-28",
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "Poha is quick, light, and made with flattened rice, onions, peanuts, and mild spices.",
    },
    {
      id: 3,
      title: "Paratha – North India’s Comfort Breakfast",
      date: "2026-02-25",
      image:
        "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "Stuffed parathas like aloo and paneer are rich, filling, and served with curd and butter.",
    },
    {
      id: 4,
      title: "Upma – Simple & Nutritious South Indian Dish",
      date: "2026-02-22",
      image:
        "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=1200&q=80",
      excerpt:
        "Made from semolina and vegetables, upma is a light and healthy breakfast option.",
    },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Indian Breakfast Blog</h1>

      <div style={styles.grid}>
        {posts.map((post) => (
          <div key={post.id} style={styles.card}>
            <img src={post.image} style={styles.image} />

            <div style={styles.content}>
              <h2 style={styles.h2}>{post.title}</h2>
              <p style={styles.date}>{post.date}</p>
              <p style={styles.excerpt}>{post.excerpt}</p>

              <button style={styles.btn}>Read More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= INLINE STYLES ================= */

const styles = {
  container: {
    padding: "80px 60px",
    minHeight: "100vh",
    background: "#fafafa",
  },

  title: {
    fontSize: "42px",
    fontWeight: "800",
    marginBottom: "40px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "28px",
  },

  card: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },

  content: {
    padding: "16px",
  },

  h2: {
    fontSize: "18px",
    marginBottom: "6px",
  },

  date: {
    fontSize: "12px",
    color: "#777",
    marginBottom: "10px",
  },

  excerpt: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.5",
  },

  btn: {
    marginTop: "12px",
    padding: "10px 14px",
    border: "none",
    background: "#111",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
  },
};
