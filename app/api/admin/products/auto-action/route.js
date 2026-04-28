import { autonomousEngine } from "@/lib/autonomousEngine";

export async function POST(req) {
  try {
    const product = await req.json();

    const decision = autonomousEngine(product);

    let status = "review";

    if (decision.action === "approve") status = "approved";
    if (decision.action === "reject") status = "rejected";

    // 🔥 UPDATE DB HERE
    // await db.products.update(...)

    return Response.json({
      success: true,
      status,
      decision,
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}
