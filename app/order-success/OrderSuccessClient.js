"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderSuccessClient() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    setOrderId(params.get("orderId") || "");
  }, [params]);

  return (
    <div>
      <h1>Order Success</h1>
      <p>Order ID: {orderId}</p>
    </div>
  );
}
