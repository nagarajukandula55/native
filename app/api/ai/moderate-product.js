export async function POST(req) {
  const body = await req.json();

  const score =
    (body.price > 0 ? 30 : 0) +
    (body.description ? 30 : 0) +
    (body.name?.length > 5 ? 20 : 0) +
    (body.category ? 20 : 0);

  let decision = "REVIEW";

  if (score > 80) decision = "APPROVE";
  else if (score < 50) decision = "REJECT";

  return Response.json({
    score,
    decision,
  });
}
