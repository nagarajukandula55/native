import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      name = "",
      brand = "Native",
      category = "",
      subcategory = "",
      ingredients = "",
    } = body;

    /* ================= NORMALIZE INGREDIENTS ================= */

    let ingredientText = "";

    if (Array.isArray(ingredients)) {
      // supports structured ingredients
      ingredientText = ingredients
        .map(i => i?.name || "")
        .filter(Boolean)
        .join(", ");
    } else {
      ingredientText = ingredients || "";
    }

    /* ================= PROMPT ================= */

    const prompt = `
You are a professional FMCG eCommerce SEO expert.

Generate HIGH-CONVERSION content for product listing.

Brand: ${brand}
Product Name: ${name}
Category: ${category}
Subcategory: ${subcategory}
Ingredients: ${ingredientText}

STRICT RULES:
- Always include BRAND name naturally
- Do NOT make medical or false claims
- Keep tone premium but simple
- Focus on benefits + usage + quality
- SEO optimized for Indian market

RETURN ONLY VALID JSON:

{
  "highlights": [
    "4-6 short bullet highlights"
  ],
  "shortDescription": "2-3 lines short selling description",
  "description": "Detailed 5-8 line product description",
  "seo": {
    "title": "SEO title with brand",
    "description": "SEO meta description",
    "keywords": "comma separated keywords"
  },
  "tags": [
    "high ranking search keywords",
    "buy ${name.toLowerCase()} online",
    "best ${name.toLowerCase()} in india"
  ]
}
`;

    /* ================= OPENAI CALL ================= */

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You generate strictly valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    let text = data?.choices?.[0]?.message?.content || "{}";

    /* ================= CLEAN RESPONSE ================= */

    // remove ```json blocks if AI adds them
    text = text.replace(/```json|```/g, "").trim();

    let parsed = {};

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.log("❌ JSON parse failed:", text);
    }

    /* ================= FALLBACK ================= */

    if (!parsed || !parsed.seo || !parsed.highlights) {
      const base = `${brand} ${name}`.trim();

      parsed = {
        highlights: [
          "Premium quality ingredients",
          "No added preservatives",
          "Easy to prepare",
          "Authentic taste",
        ],
        shortDescription: `${base} made with carefully selected ingredients for authentic taste.`,
        description: `${base} is a high-quality product in the ${category} category. Crafted for convenience and taste, it is perfect for daily use and delivers consistent results every time.`,
        seo: {
          title: `${base} | Buy Online`,
          description: `Buy ${base} online at best price in India. Premium quality and authentic taste.`,
          keywords: `${base}, ${name}, ${category}, buy online, best price`,
        },
        tags: [
          `${base}`,
          `buy ${name.toLowerCase()} online`,
          `${name.toLowerCase()} india`,
          `best ${name.toLowerCase()}`,
          `instant ${name.toLowerCase()}`,
        ],
      };
    }

    /* ================= FINAL RESPONSE ================= */

    return NextResponse.json({
      success: true,
      content: parsed,
    });

  } catch (err) {
    console.error("🔥 AI CONTENT ERROR:", err);

    return NextResponse.json(
      { success: false, message: "AI generation failed" },
      { status: 500 }
    );
  }
}
