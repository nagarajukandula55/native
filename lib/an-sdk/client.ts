const AN_API =
  process.env.NEXT_PUBLIC_AN_API!;

export async function anFetch(
  endpoint: string,
  options?: RequestInit
) {
  const res = await fetch(
    `${AN_API}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },

      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "API Error"
    );
  }

  return data;
}
