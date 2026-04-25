import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { name, brand, category, subcategory, ingredients } = body;

    /* ================= PROMPT ================= */

    const prompt = `
    You are an expert eCommerce copywriter.
    
    Brand: ${brand}
    Product Name: ${name}
    Category: ${category}
    Subcategory: ${subcategory}
    Ingredients: ${ingredients}
    
    IMPORTANT:
    - Always include brand name in content
    - Make it SEO optimized
    - Avoid false claims
    
    Return ONLY JSON:
    
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

    /* ================= OPENAI ================= */

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

    const text = data?.choices?.[0]?.message?.content || "{}";

    /* ✅ FIX: declare parsed BEFORE try */
    let parsed = {};

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.log("JSON parse failed, using fallback");
    }

    /* ================= FALLBACK ================= */

    if (!parsed || !parsed.seo || !parsed.highlights) {
      parsed = {
        highlights: [
          "High quality ingredients",
          "No preservatives",
          "Easy to prepare",
          "Authentic taste",
        ],
        shortDescription: `${name} made with premium ingredients`,
        description: `${name} is a quality product in ${category}`,
        seo: {
          title: `${name} | Buy Online`,
          description: `Buy ${name} at best price`,
          keywords: `${name}, ${category}, buy online`,
        },
      };
    }

    return NextResponse.json({
      success: true,
      content: parsed,
    });

  } catch (err) {
    console.error("AI CONTENT ERROR:", err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
