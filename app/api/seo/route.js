import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, category } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const seo = {
      title: `${name} | Buy Online at Best Price`,
      description: `Buy premium ${name} online in India. Fresh, authentic and best quality ${category}. Fast delivery.`,
      keywords: `${name}, buy ${name}, ${category}, best ${name} online, shop native`,
    };

    return NextResponse.json({ success: true, seo });

  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
