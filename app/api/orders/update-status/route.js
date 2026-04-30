import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();

    const { id, status } = await req.json();

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return Response.json({
      success: true,
      order: updated,
    });

  } catch (err) {
    console.error(err);
    return Response.json({
      success: false,
      message: "Update failed",
    });
  }
}
