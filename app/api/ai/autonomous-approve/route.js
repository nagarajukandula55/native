import { autonomousEngine } from "@/lib/autonomousEngine";

export async function POST(req) {
  try {
    const product = await req.json();

    const result = autonomousEngine(product);

    return Response.json({
      success: true,
      result,
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}
