import { anGet, anPost } from "./client";

export type Review = {
  id?: string;
  productId: string;
  rating: number;
  title?: string;
  body: string;
  authorName: string;
  email?: string;
  verifiedPurchase?: boolean;
  createdAt?: string;
};

/**
 * ANgroup's real GET /api/reviews route (confirmed by reading
 * src/app/api/reviews/route.ts) requires both productId AND businessId as
 * query params, and returns the rating summary embedded in the same
 * response as `summary: { averageRating, count }` — there is no separate
 * /api/reviews/summary route. It also returns each review's fields as
 * reviewerName/comment (not authorName/body). Normalizing both the
 * request (add businessId) and the response shape here so ReviewsSection
 * can keep using authorName/body/average/count as before.
 */
export async function getReviews(productId: string, page = 1) {
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "";
  const data = await anGet(
    `/api/reviews?productId=${encodeURIComponent(productId)}&businessId=${encodeURIComponent(businessId)}&page=${page}`
  );
  return {
    ...data,
    reviews: (data?.reviews || []).map((r: any) => ({
      id: r.id,
      authorName: r.reviewerName,
      rating: r.rating,
      title: r.title,
      body: r.comment,
      verifiedPurchase: !!r.verifiedPurchase,
      createdAt: r.createdAt,
    })),
    summary: {
      average: data?.summary?.averageRating || 0,
      count: data?.summary?.count || 0,
    },
  };
}

/**
 * There is no standalone /api/reviews/summary route on ANgroup — the
 * summary comes back embedded in GET /api/reviews (see getReviews above).
 * Kept as a thin wrapper around getReviews so existing callers that fetch
 * the summary separately still work, without a second network round trip
 * to a route that doesn't exist.
 */
export async function getReviewSummary(productId: string) {
  const data = await getReviews(productId);
  return data.summary;
}

/**
 * ANgroup's real POST /api/reviews route (public, no auth required) expects
 * { productId, businessId, rating, reviewerName, reviewerEmail?, title?,
 * comment? } — not { authorName, body }. Mapping the SDK's public Review
 * shape onto the backend's real field names here.
 */
/**
 * GET /api/reviews/recent — top-rated recent reviews across every
 * product, for a homepage "What our customers say" section.
 */
export async function getRecentReviews(limit = 6) {
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "";
  const data = await anGet(`/api/reviews/recent?businessId=${encodeURIComponent(businessId)}&limit=${limit}`);
  return {
    reviews: (data?.reviews || []).map((r: any) => ({
      id: r.id,
      authorName: r.reviewerName,
      rating: r.rating,
      title: r.title,
      body: r.comment,
      verifiedPurchase: !!r.verifiedPurchase,
      productName: r.productName,
      productSlug: r.productSlug,
      createdAt: r.createdAt,
    })),
  };
}

export async function submitReview(review: Review) {
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "";
  return anPost("/api/reviews", {
    productId: review.productId,
    businessId,
    rating: review.rating,
    reviewerName: review.authorName,
    reviewerEmail: review.email || undefined,
    title: review.title,
    comment: review.body,
  });
}
