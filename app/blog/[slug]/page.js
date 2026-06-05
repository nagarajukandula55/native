import { connectDB } from "@/lib/an-db";
import Blog from "@/models/Blog";

export default async function BlogDetail({ params }) {
  await connectDB();

  const blog = await Blog.findOne({ slug: params.slug }).lean();

  if (!blog) {
    return <h1 style={{ padding: 40 }}>Blog not found</h1>;
  }

  return (
    <div style={{ padding: 60, maxWidth: 800, margin: "auto" }}>
      <img
        src={blog.image}
        style={{ width: "100%", borderRadius: 12 }}
      />

      <h1 style={{ marginTop: 20 }}>{blog.title}</h1>

      <p style={{ color: "#777" }}>{blog.category}</p>

      <p style={{ marginTop: 20, fontSize: 18, lineHeight: 1.6 }}>
        {blog.content}
      </p>
    </div>
  );
}
