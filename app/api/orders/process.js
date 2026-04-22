import { requirePermission } from "@/lib/guard";

export async function POST(req) {
  return requirePermission(req, "orders.process", (user) => {
    return Response.json({
      success: true,
      message: "Order processed",
      user: user.name,
    });
  });
}
