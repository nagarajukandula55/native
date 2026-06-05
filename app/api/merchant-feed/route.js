import { NextResponse } from "next/server";

// Replace this with your DB fetch (MongoDB / Prisma / API)
async function getProducts() {
  return [
    {
      id: "1",
      title: "Wireless Bluetooth Headphones",
      description: "High quality sound with noise cancellation",
      link: "https://yourdomain.com/product/wireless-headphones",
      image: "https://yourdomain.com/images/headphones.jpg",
      price: "1999 INR",
      availability: "in stock",
      brand: "YourBrand",
    },
    {
      id: "2",
      title: "Smart Watch Pro",
      description: "Fitness tracking smart watch",
      link: "https://yourdomain.com/product/smart-watch-pro",
      image: "https://yourdomain.com/images/watch.jpg",
      price: "2999 INR",
      availability: "in stock",
      brand: "YourBrand",
    },
  ];
}

export async function GET() {
  const products = await getProducts();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
 xmlns:g="http://base.google.com/ns/1.0">

<channel>
  <title>Your Store Product Feed</title>
  <link>https://yourdomain.com</link>
  <description>Google Merchant Center Product Feed</description>

  ${products
    .map(
      (p) => `
  <item>
    <g:id>${p.id}</g:id>
    <g:title><![CDATA[${p.title}]]></g:title>
    <g:description><![CDATA[${p.description}]]></g:description>
    <g:link>${p.link}</g:link>
    <g:image_link>${p.image}</g:image_link>
    <g:brand>${p.brand}</g:brand>
    <g:availability>${p.availability}</g:availability>
    <g:price>${p.price}</g:price>
    <g:condition>new</g:condition>
  </item>
  `
    )
    .join("")}

</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
