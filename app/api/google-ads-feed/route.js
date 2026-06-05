import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/lib/mongodb";
import { transformProductForMerchant } from "@/lib/merchantTransform";

export async function GET() {
  await connectDB();

  const products = await Product.find({
    isDeleted: false,
    isListed: true,
    status: "approved",
  });

  const items = products
    .map(transformProductForMerchant)
    .filter(Boolean);

  const jsonFeed = {
    title: "Google Ads Dynamic Remarketing Feed",
    items: items.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image_link: p.image,
      link: p.link,
      brand: p.brand,
      availability: p.availability,
    })),
  };

  return NextResponse.json(jsonFeed, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
