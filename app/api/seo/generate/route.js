export async function POST(req) {
  const { name } = await req.json();

  return Response.json({
    title: name + " | Buy Online",
    description: "Best price for " + name,
    keywords: [name, "buy online", "best price"],
  });
}
