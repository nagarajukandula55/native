import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req, res) {
  try {
    const { productName, ingredients, quantity } = await req.json();

    // 1️⃣ Generate label automatically
    const label = {
      name: productName,
      sku: "SKU-" + nanoid(6),
      size: `${quantity * 100}ml`,
      quality: "Premium",
    };

    // 2️⃣ Generate nutrition automatically (dummy calculation)
    const nutrition = {
      calories: Math.floor(Math.random() * 200) + 50,
      protein: Math.floor(Math.random() * 10),
      fat: Math.floor(Math.random() * 10),
      carbs: Math.floor(Math.random() * 30),
    };

    // 3️⃣ Full pricing calculator
    const baseCost = 50; // raw material
    const labor = 20;
    const packaging = 15;
    const marketing = 10;
    const transport = 5;
    const taxes = 0.12 * (baseCost + labor + packaging + marketing + transport); // 12% GST
    const misc = 5;
    const price = (baseCost + labor + packaging + marketing + transport + taxes + misc) * quantity;

    // 4️⃣ Generate social post automatically
    const socialPost = `Check out our new ${productName}! Packed with quality ingredients: ${ingredients}. Only ₹${price}! #${productName.replace(/\s+/g,"")} #PremiumQuality`;

    return NextResponse.json({ success: true, label, nutrition, price, socialPost });
  } catch (err) {
    return NextResponse.json({ success: false, msg: err.message });
  }
}
