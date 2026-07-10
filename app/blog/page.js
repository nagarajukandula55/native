import BlogPageClient from "./BlogPageClient";

export const metadata = {
  title: "Indian Food Blog | Native",
  description:
    "Recipes, ingredient guides, and stories about natural, traditional Indian food — from cold-pressed oils to millets and spices — from the Native team.",
  openGraph: {
    title: "Indian Food Blog | Native",
    description:
      "Recipes, ingredient guides, and stories about natural, traditional Indian food from the Native team.",
    url: "https://shopnative.in/blog",
    siteName: "Native",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Food Blog | Native",
    description:
      "Recipes, ingredient guides, and stories about natural, traditional Indian food.",
  },
  alternates: {
    canonical: "https://shopnative.in/blog",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
