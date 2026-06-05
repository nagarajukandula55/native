import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db";
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
 xmlns:g="http://base.google.com/ns/1.0">

<channel>
  <title>Your Store Merchant Feed</title>
  <link>https://yourdomain.com</link>
  <description>Auto-generated Google Shopping Feed</description>

  ${items
    .map((p) => {
      return `
  <item>
    <g:id>${p.id}</g:id>
    <g:title><![CDATA[${p.title}]]></g:title>
    <g:description><![CDATA[${p.description}]]></g:description>
    <g:link>${p.link}</g:link>
    <g:image_link>${p.image}</g:image_link>

    <g:brand>${p.brand}</g:brand>

    <g:availability>${p.availability}</g:availability>

    <g:price>${p.price}</g:price>

    ${
      p.salePrice
        ? `<g:sale_price>${p.salePrice}</g:sale_price>`
        : ""
    }

    <g:condition>${p.condition}</g:condition>

    ${
      p.gtin
        ? `<g:gtin>${p.gtin}</g:gtin>`
        : ""
    }

    ${
      p.googleCategory
        ? `<g:google_product_category>${p.googleCategory}</g:google_product_category>`
        : ""
    }

  </item>`;
    })
    .join("")}

</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
