"use client";
import { useEffect, useState } from "react";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const res = await fetch("/api/branding/posts");
    const data = await res.json();
    if (data.success) setPosts(data.posts);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Social Media Posts</h1>
      <a href="/branding/posts/create" style={{ marginBottom: 10, display: "inline-block", color: "#2563eb" }}>+ Create Post</a>

      {posts.map((post) => (
        <div key={post._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
          <h3>{post.title} - {post.platform}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
