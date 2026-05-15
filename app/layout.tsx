"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutButton({
  cart,
  address,
}: any) {
  const [loading, setLoading] =
    useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      /* =========================================================
         VALIDATE SDK
      ========================================================= */

      if (!window.Razorpay) {
        alert(
          "Razorpay SDK failed to load"
        );

        return;
      }

      /* =========================================================
         PAYLOAD
      ========================================================= */

      const payload = {
        source: "NATIVE",

        cart,

        address,

        paymentMethod: "RAZORPAY",

        gstType: "B2C",
      };

      console.log(
        "CHECKOUT PAYLOAD:",
        payload
      );

      /* =========================================================
         CREATE ORDER
      ========================================================= */

      const response = await fetch(
        "https://www.angroup.in/api/orders/create",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      console.log(
        "ORDER API RESPONSE:",
        data
      );

      /* =========================================================
         API VALIDATION
      ========================================================= */

      if (!response.ok) {
        alert(
          data?.message ||
            "Order creation failed"
        );

        return;
      }

      if (!data?.success) {
        alert(
          data?.message ||
            "Order failed"
        );

        return;
      }

      if (
        !data?.razorpayOrder?.id
      ) {
        console.error(
          "INVALID RAZORPAY ORDER:",
          data
        );

        alert(
          "Razorpay order creation failed"
        );

        return;
      }

      /* =========================================================
         RAZORPAY OPTIONS
      ========================================================= */

      const options = {
        key:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount:
          Number(data.amount) *
          100,

        currency: "INR",

        name: "Native",

        description:
          "Order Payment",

        image:
          "/favicon.ico",

        order_id:
          data.razorpayOrder.id,

        handler: async function (
          response: any
        ) {
          console.log(
            "PAYMENT SUCCESS:",
            response
          );

          try {
            const verifyRes =
              await fetch(
                "https://www.angroup.in/api/payment/verify",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify(
                    {
                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,

                      orderId:
                        data.orderId,
                    }
                  ),
                }
              );

            const verifyData =
              await verifyRes.json();

            console.log(
              "VERIFY RESPONSE:",
              verifyData
            );

            if (
              verifyData.success
            ) {
              alert(
                "Payment successful"
              );

              window.location.href = `/payment-success?orderId=${data.orderId}`;
            } else {
              alert(
                verifyData.message ||
                  "Payment verification failed"
              );
            }
          } catch (err) {
            console.error(
              "VERIFY ERROR:",
              err
            );

            alert(
              "Payment verification failed"
            );
          }
        },

        modal: {
          ondismiss:
            function () {
              console.log(
                "Razorpay popup closed"
              );
            },
        },

        prefill: {
          name:
            address?.name || "",

          contact:
            address?.phone ||
            "",

          email:
            address?.email ||
            "",
        },

        notes: {
          orderId:
            data.orderId,
        },

        theme: {
          color: "#000000",
        },
      };

      console.log(
        "RAZORPAY EXISTS:",
        window.Razorpay
      );

      console.log(
        "RAZORPAY OPTIONS:",
        options
      );

      /* =========================================================
         OPEN CHECKOUT
      ========================================================= */

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "PAYMENT FAILED:",
            response
          );

          alert(
            response?.error
              ?.description ||
              "Payment failed"
          );
        }
      );

      console.log(
        "OPENING RAZORPAY"
      );

      setTimeout(() => {
        razorpay.open();
      }, 100);
    } catch (err: any) {
      console.error(
        "CHECKOUT ERROR:",
        err
      );

      alert(
        err?.message ||
          "Checkout failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-black text-white py-3 rounded-xl font-semibold"
    >
      {loading
        ? "Loading Payment Gateway..."
        : "Proceed to Pay"}
    </button>
  );
}
