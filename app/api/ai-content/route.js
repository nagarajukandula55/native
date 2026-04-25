import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, category, subcategory, ingredients } = await req.json();

    const prompt = `
Generate eCommerce content for:

Name: ${name}
Category: ${category}
Subcategory: ${subcategory}
Ingredients: ${ingredients}

Return JSON:
{
  "highlights": ["", "", "", ""],
  "shortDescription": "",
  "description": "",
  "seo": {
    "title": "",
    "description": "",
    "keywords": ""
  }
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      success: true,
      content: parsed,
    });

  } catch {
    return NextResponse.json({ success: false });
  }
}

if (!parsed.seo || !parsed.highlights) {
  parsed = {
    highlights: [
      "High quality ingredients",
      "No preservatives",
      "Easy to prepare",
      "Authentic taste",
    ],
    shortDescription: `${name} made with premium ingredients`,
    description: `${name} is a high-quality product in ${category}`,
    seo: {
      title: `${name} | Buy Online`,
      description: `Buy ${name} at best price`,
      keywords: `${name}, ${category}, buy online`,
    },
  };
}
