import { anGet } from "./client";

export async function getBlogList() {
  return anGet("/api/blog/list");
}

/**
 * ANgroup has no GET /api/blog/:slug route — only /api/blog/list (all
 * posts), /api/blog/create, and /api/blog/delete/[id] exist (confirmed by
 * reading src/app/api/blog). Its Blog model does have a unique `slug`
 * field, so we fetch the full list and find the matching post client-side
 * rather than hitting a route that 404s.
 */
export async function getBlogBySlug(slug: string) {
  const data = await getBlogList();
  const blog = (data?.blogs || []).find((b: any) => b.slug === slug) || null;
  return { success: !!blog, blog };
}
