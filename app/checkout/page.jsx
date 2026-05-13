"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const SELLER_STATE = "Andhra Pradesh";

/* ================= GST ================= */

const getGST = (
  base,
  gstPercent = 0,
  isInterState
) => {
  const gst = (base * gstPercent) / 100;

  if (isInterState) {
    return {
      igst: gst,
      cgst: 0,
      sgst: 0,
      gstTotal: gst,
    };
  }

  return {
    cgst: gst / 2,
    sgst: gst / 2,
    igst: 0,
    gstTotal: gst,
  };
};

/* ================= GST VALIDATION ================= */

const validateGST = (gst) => {
  if (!gst) return true;

  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gst
  );
};

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    cartTotal,
    setCart,
    closeCart,
  } = useCart();

  const [loading, setLoading] =
    useState(false);

  const [coupon, setCoupon] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [gstData, setGstData] =
    useState(null);

  const [enrichedCart, setEnrichedCart] =
    useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    gstNumber: "",
  });

  /* ================= RAZORPAY SCRIPT ================= */

  useEffect(() => {
    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    document.body.appendChild(script);
  }, []);

  /* ================= CART ENRICH ================= */

  useEffect(() => {
    const enrichCart = async () => {
      try {
        const res = await fetch(
          "/api/cart/enrich",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              cart,
            }),
          }
        );

        const data = await res.json();

        if (
          data.success &&
          Array.isArray(data.cart)
        ) {
          setEnrichedCart(data.cart);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (cart?.length) {
      enrichCart();
    }
  }, [cart]);

  /* ================= PINCODE AUTO ================= */

  useEffect(() => {
    if (form.pincode?.length !== 6)
      return;

    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${form.pincode}`
        );

        const data = await res.json();

        if (
          data?.[0]?.Status === "Success"
        ) {
          const po =
            data[0].PostOffice?.[0];

          setForm((prev) => ({
            ...prev,
            city: po?.District || "",
            state: po?.State || "",
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchLocation();
  }, [form.pincode]);

  /* ================= INPUT ================= */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  /* ================= GST VERIFY ================= */

  const verifyGST = async () => {
    if (!form.gstNumber) return;

    try {
      const res = await fetch(
        "/api/gst/verify",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            gstNumber:
              form.gstNumber,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setGstData(data.data);
      } else {
        setGstData(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= COUPON ================= */

  const applyCoupon = async () => {
    try {
      const res = await fetch(
        "/api/coupons/validate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            code: coupon,
            cartTotal,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);

        setDiscount(0);

        return;
      }

      setDiscount(data.discount);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SAFE CART ================= */

  const safeCart =
    enrichedCart?.length
      ? enrichedCart
      : cart || [];

  const isInterState =
    form.state &&
    form.state !== SELLER_STATE;

  const taxItems = safeCart.map(
    (item) => {
      const base =
        item.price * item.qty;

      const gstPercent =
        item.gstPercent ||
        item.tax ||
        0;

      const tax = getGST(
        base,
        gstPercent,
        isInterState
      );

      return {
        ...item,

        base,

        gstPercent,

        ...tax,
      };
    }
  );

  const subtotal = cartTotal || 0;

  const gstTotal =
    taxItems.reduce(
      (a, b) => a + b.gstTotal,
      0
    );

  const cgstTotal =
    taxItems.reduce(
      (a, b) => a + b.cgst,
      0
    );

  const sgstTotal =
    taxItems.reduce(
      (a, b) => a + b.sgst,
      0
    );

  const igstTotal =
    taxItems.reduce(
      (a, b) => a + b.igst,
      0
    );

  const finalAmount =
    subtotal +
    gstTotal -
    discount;

  /* ================= ORDER ================= */

  const handleOrder = async () => {
    if (
      !form.name ||
      !form.phone ||
      !form.address
    ) {
      alert(
        "Please fill all required details"
      );

      return;
    }

    if (
      form.pincode?.length !== 6
    ) {
      alert("Invalid pincode");

      return;
    }

    if (
      !validateGST(
        form.gstNumber
      )
    ) {
      alert("Invalid GST Number");

      return;
    }

    try {
      setLoading(true);

      const cleanedCart =
        safeCart.map((item) => {
          const base =
            item.price * item.qty;

          const gstPercent =
            item.gstPercent ||
            item.tax ||
            0;

          const tax = getGST(
            base,
            gstPercent,
            isInterState
          );

          return {
            productId:
              item.productId ||
              item._id,

            name: item.name,

            qty: item.qty,

            price: item.price,

            variant:
              item.variant ||
              "default",

            taxableValue: base,

            gstPercent,

            cgst: tax.cgst,

            sgst: tax.sgst,

            igst: tax.igst,

            gstTotal:
              tax.gstTotal,

            lineTotal:
              base +
              tax.gstTotal,
          };
        });

      const billing = {
        subtotal,

        discount,

        cgstTotal,

        sgstTotal,

        igstTotal,

        gstTotal,

        grandTotal:
          finalAmount,

        currency: "INR",

        locked: true,
      };

      const gstType =
        form.gstNumber
          ? "B2B"
          : "B2C";

      const gstMode =
        isInterState
          ? "IGST"
          : "CGST_SGST";

      const res = await fetch(
        "https://www.angroup.in/api/orders/create",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            cart: cleanedCart,

            address: {
              ...form,
            },

            amount:
              finalAmount,

            billing,

            coupon,

            discount,

            paymentMethod:
              "RAZORPAY",

            gstType,

            gstMode,
          }),
        }
      );

      const data =
        await res.json();

      if (!data.success) {
        alert(
          data.message ||
            "Order failed"
        );

        setLoading(false);

        return;
      }

      if (!window.Razorpay) {
        alert(
          "Payment gateway unavailable. Please contact support."
        );

        return;
      }

      const options = {
        key:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: Math.round(
          finalAmount * 100
        ),

        currency: "INR",

        name: "Native",

        description:
          "Order Payment",

        order_id:
          data.razorpayOrder.id,

        prefill: {
          name: form.name,
          contact: form.phone,
          email: form.email,
        },

        handler:
          async function (
            response
          ) {
            const verifyRes =
              await fetch(
                "https://www.angroup.in/api/payment/verify",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body:
                    JSON.stringify(
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

            if (
              verifyData.success
            ) {
              setCart([]);

              closeCart();

              router.push(
                `/order-success?orderId=${data.orderId}`
              );
            } else {
              alert(
                "Payment verification failed"
              );
            }
          },

        modal: {
          ondismiss:
            function () {
              setLoading(false);

              alert(
                "Payment cancelled. If amount was debited contact support."
              );
            },
        },

        theme: {
          color: "#000000",
        },
      };

      const rzp =
        new window.Razorpay(
          options
        );

      rzp.open();
    } catch (err) {
      console.error(err);

      alert(
        "Checkout failed"
      );

      setLoading(false);
    }
  };

  return (
    <div className="checkout">
      <div className="box">
        <h2>Checkout</h2>

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          name="address"
          placeholder="Address"
          onChange={handleChange}
        />

        <input
          name="pincode"
          placeholder="Pincode"
          onChange={handleChange}
        />

        <input
          value={form.city}
          disabled
          placeholder="City"
        />

        <input
          value={form.state}
          disabled
          placeholder="State"
        />

        <input
          name="gstNumber"
          placeholder="GST Number"
          value={form.gstNumber}
          onChange={handleChange}
          onBlur={verifyGST}
        />

        {gstData && (
          <div className="gstBox">
            GST Verified ✅
          </div>
        )}

        <div className="coupon">
          <input
            value={coupon}
            onChange={(e) =>
              setCoupon(
                e.target.value
              )
            }
            placeholder="Coupon"
          />

          <button
            onClick={applyCoupon}
          >
            Apply
          </button>
        </div>

        <button
          onClick={handleOrder}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : `Pay ₹${finalAmount.toFixed(
                2
              )}`}
        </button>
      </div>

      <div className="box">
        <h3>Order Summary</h3>

        {taxItems.map(
          (item, i) => (
            <div key={i}>
              <div className="row">
                <span>
                  {item.name} x{" "}
                  {item.qty}
                </span>

                <span>
                  ₹{item.base}
                </span>
              </div>
            </div>
          )
        )}

        <hr />

        <div className="row">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        {!isInterState ? (
          <>
            <div className="row">
              <span>CGST</span>
              <span>
                ₹{cgstTotal}
              </span>
            </div>

            <div className="row">
              <span>SGST</span>
              <span>
                ₹{sgstTotal}
              </span>
            </div>
          </>
        ) : (
          <div className="row">
            <span>IGST</span>
            <span>
              ₹{igstTotal}
            </span>
          </div>
        )}

        <div className="row total">
          <b>Total</b>

          <b>
            ₹
            {finalAmount.toFixed(
              2
            )}
          </b>
        </div>
      </div>

      <style jsx>{`
        .checkout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .box {
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 20px;
        }

        input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
        }

        button {
          width: 100%;
          padding: 12px;
          background: black;
          color: white;
          border: none;
          cursor: pointer;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .coupon {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .gstBox {
          background: #f0fff0;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
