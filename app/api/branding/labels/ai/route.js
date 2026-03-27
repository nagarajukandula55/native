import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    await connectDB();
    const { productName, nutrition, targetAudience } = await req.json();

    // ✅ Generate label text using AI
    const prompt = `Create a professional product label for ${productName}, nutrition info: ${JSON.stringify(
      nutrition
    )}, for ${targetAudience}. Include regulatory info, catchy title, and description.`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
    });

    const labelText = aiResponse.choices[0].message.content;

    // ✅ Save in DB
    const newLabel = await Label.create({
      productName,
      nutrition,
      aiText: labelText,
    });

    return NextResponse.json({ success: true, label: newLabel });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: err.message }, { status: 500 });
  }
}
