export default async function InvoicePage({ params }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${params.orderId}`,
    { cache: "no-store" }
  );

  const data = await res.json();

  if (!data.success) return <p>Invoice not found</p>;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: data.order.invoiceHTML }}
    />
  );
}
