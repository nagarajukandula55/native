import { getBlogBySlug } from "@/lib/an-sdk/blog";

/* ================= METADATA ================= */
export async function generateMetadata({ params }) {
  try {
    const data = await getBlogBySlug(params.slug);
    const blog = data?.blog || data;

    if (!blog) {
      return { title: "Blog Not Found | Native" };
    }

    const title = blog.title || "Native Blog";
    const description = blog.excerpt || blog.category || "Read the latest from the Native blog.";
    const url = `https://shopnative.in/blog/${params.slug}`;

    return {
      title: `${title} | Native Blog`,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "Native",
        images: blog.image ? [blog.image] : [],
        type: "article",
        locale: "en_IN",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: blog.image ? [blog.image] : [],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    return { title: "Native Blog" };
  }
}

export default async function BlogDetail({ params }) {
  let blog = null;

  try {
    const data = await getBlogBySlug(params.slug);
    blog = data?.blog || data;
  } catch (err) {
    blog = null;
  }

  if (!blog) {
    return <h1 style={{ padding: 40 }}>Blog not found</h1>;
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    image: blog.image ? [blog.image] : undefined,
    description: blog.excerpt || undefined,
    articleSection: blog.category || undefined,
  };

  return (
    <div style={{ padding: 60, maxWidth: 800, margin: "auto" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

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
