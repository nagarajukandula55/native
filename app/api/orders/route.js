import { NextResponse } from "next/server";

// Temporary in-memory storage (resets on server restart)
let orders = [];

export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, items } = body;

    // Basic validation
    if (!customer || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Invalid order data" },
        { status: 400 }
      );
    }

    // 🔒 Recalculate total on server (never trust frontend)
    const totalAmount = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // Generate unique Order ID
    const orderId = `ORD-${Date.now()}`;

    const newOrder = {
      orderId,
      customer,
      items,
      totalAmount,
      status: "PENDING",
      createdAt: new Date(),
    };

    // Save order temporarily
    orders.push(newOrder);

    return NextResponse.json(
      {
        message: "Order created successfully",
        orderId,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
