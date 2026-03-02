const samplePosts = [
  { id: 1, title: "The Art of Indian Handicrafts", date: "2026-03-01", excerpt: "Discover the beauty of traditional Indian handicrafts..." },
  { id: 2, title: "Top 5 Must-Have Traditional Items", date: "2026-02-28", excerpt: "Explore essential traditional items for your home..." },
];

export default function BlogPage() {
  return (
    <div style={{ padding: "80px 60px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "40px", marginBottom: "40px" }}>Blog</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {samplePosts.map((post) => (
          <div key={post.id} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "20px" }}>
            <h2>{post.title}</h2>
            <p style={{ fontSize: "14px", color: "#666" }}>{post.date}</p>
            <p>{post.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
