import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();

    const prompt = `
You are an eCommerce product moderation expert.

Analyze this product:

Name: ${body.name}
Category: ${body.category}
Price: ${body.price}
Description: ${body.description}

Check for:
- Content quality
- Missing information
- Compliance risks (FSSAI, misleading claims)
- Pricing issues

Respond ONLY in JSON:

{
  "score": number (0-100),
  "decision": "APPROVE" | "REVIEW" | "REJECT",
  "issues": ["..."],
  "summary": "short explanation"
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const text = response.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        score: 50,
        decision: "REVIEW",
        issues: ["AI parse error"],
        summary: text,
      };
    }

    return Response.json(parsed);

  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, message: "AI moderation failed" },
      { status: 500 }
    );
  }
}
