import BlogCard from "@/components/BlogCard";

async function getBlogs() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/blog`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {blogs.map((b: any) => (
        <BlogCard key={b._id} blog={b} />
      ))}
    </div>
  );
}
