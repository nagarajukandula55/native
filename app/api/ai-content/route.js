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

    /* ================= VALIDATION ================= */

    if (!name || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ================= NORMALIZE INGREDIENTS ================= */

    let ingredientText = "";

    if (Array.isArray(ingredients)) {
      ingredientText = ingredients
        .map(i => i?.name || "")
        .filter(Boolean)
        .join(", ");
    } else {
      ingredientText = ingredients || "";
    }

    /* ================= PROMPT ================= */

    const prompt = `
You are a top-tier Indian eCommerce SEO expert for FMCG products.

Generate HIGH-CONVERSION, SEO-OPTIMIZED product content.

INPUT:
Brand: ${brand}
Product Name: ${name}
Category: ${category}
Subcategory: ${subcategory}
Ingredients: ${ingredientText}

STRICT RULES:
- Always include BRAND naturally
- No medical/false claims
- Tone: premium, simple, trustworthy
- Target Indian buyers (Google search intent)
- Use keywords like: buy, best, online, India

OUTPUT RULES:
- Return ONLY VALID JSON (no markdown, no text)
- Ensure JSON is parseable

STRUCTURE:
{
  "highlights": ["5 strong selling bullet points"],
  "shortDescription": "2-3 lines (max 160 chars)",
  "description": "120-180 words SEO-rich description",
  "seo": {
    "title": "Max 60 chars",
    "description": "Max 155 chars",
    "keywords": "comma separated keywords"
  },
  "tags": ["10-20 high intent keywords"]
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
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content: "Return strictly valid JSON only. No markdown.",
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

    text = text.replace(/```json|```/g, "").trim();

    let parsed = null;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.log("❌ JSON parse failed:", text);
    }

    /* ================= HARD VALIDATION ================= */

    const isValid =
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.highlights) &&
      parsed.seo &&
      parsed.description;

    /* ================= FALLBACK ================= */

    if (!isValid) {
      const base = `${brand} ${name}`.trim();

      parsed = {
        highlights: [
          "Premium quality ingredients",
          "No added preservatives",
          "Easy to prepare",
          "Authentic taste",
          "Suitable for daily use",
        ],
        shortDescription: `${base} made with carefully selected ingredients for authentic taste.`,
        description: `${base} is a high-quality ${category} product designed for convenience and taste. Crafted using selected ingredients, it ensures consistent results and authentic flavor in every use. Perfect for daily cooking and easy preparation, it brings both quality and reliability to your kitchen.`,
        seo: {
          title: `${base} | Buy Online`,
          description: `Buy ${base} online at best price in India. Premium quality and authentic taste.`,
          keywords: `${base}, ${name}, ${category}, buy online, best price, India`,
        },
        tags: [
          `${base}`,
          `buy ${name.toLowerCase()} online`,
          `${name.toLowerCase()} india`,
          `best ${name.toLowerCase()}`,
          `instant ${name.toLowerCase()}`,
          `${category.toLowerCase()} online`,
        ],
      };
    }

    /* ================= FINAL SANITIZATION ================= */

    parsed.highlights = parsed.highlights.slice(0, 6);
    parsed.tags = (parsed.tags || []).slice(0, 20);

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
