import Link from "next/link";

interface BlogCardProps {
  blog: {
    _id: string;
    title: string;
    content: string;
  };
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
      <p className="text-gray-600 mb-4">{blog.content.substring(0, 120)}...</p>
      <Link href={`/blog/${blog._id}`} className="text-blue-600">
        Read More
      </Link>
    </div>
  );
}
