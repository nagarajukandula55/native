"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "nraj.k55@ybl";
const UPI_NAME = "Native";
const SELLER_STATE = "Andhra Pradesh";

const getGST = (base, gstPercent = 0, isInterState) => {
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

const validateGST = (gst) => {
  if (!gst) return true;

  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gst
  );
};

export default function CheckoutPage() {
  const router = useRouter();

  const { cart, cartTotal, setCart, closeCart } = useCart();

  const [loading, setLoading] = useState(false);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const [gstData, setGstData] = useState(null);
  const [gstLoading, setGstLoading] = useState(false);

  const [enrichedCart, setEnrichedCart] = useState([]);

  const [paymentMethod, setPaymentMethod] =
    useState("RAZORPAY");

  const [paymentSettings, setPaymentSettings] =
    useState({
      razorpay: true,
      upi: true,
      cod: true,
    });

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

  /* ================= PAYMENT SETTINGS ================= */

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch(
        "/api/admin/payment-settings"
      );

      const data = await res.json();

      if (data.success) {
        setPaymentSettings({
          razorpay: data.settings?.razorpay,
          upi: data.settings?.upi,
          cod: data.settings?.cod,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= LOAD RAZORPAY ================= */

  useEffect(() => {
    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /* ================= CART ENRICH ================= */

  useEffect(() => {
    const enrichCart = async () => {
      try {
        const res = await fetch("/api/cart/enrich", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cart }),
        });

        const data = await res.json();

        if (data.success && Array.isArray(data.cart)) {
          setEnrichedCart(data.cart);
        } else {
          setEnrichedCart(cart || []);
        }
      } catch (err) {
        console.error(err);
        setEnrichedCart(cart || []);
      }
    };

    if (cart?.length) {
      enrichCart();
    } else {
      setEnrichedCart([]);
    }
  }, [cart]);

  /* ================= PINCODE ================= */

  useEffect(() => {
    if (form.pincode?.length !== 6) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${form.pincode}`
        );

        const data = await res.json();

        if (data?.[0]?.Status === "Success") {
          const po = data[0]?.PostOffice?.[0];

          setForm((prev) => ({
            ...prev,
            city: po?.District || "",
            state: po?.State || "",
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.pincode]);

  /* ================= FORM ================= */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= SAFE CART ================= */

  const safeCart =
    Array.isArray(enrichedCart) &&
    enrichedCart.length
      ? enrichedCart
      : Array.isArray(cart)
      ? cart
      : [];

  const isInterState =
    form.state &&
    form.state !== SELLER_STATE;

  /* ================= TAX ================= */

  const taxItems = safeCart.map((item) => {
    const base =
      Number(item.price || 0) *
      Number(item.qty || 1);

    const gstPercent =
      Number(item.gstPercent || item.tax || 0);

    const tax = getGST(
      base,
      gstPercent,
      isInterState
    );

    return {
      ...item,

      base,

      hsn:
        item.hsn ||
        item.product?.hsn ||
        "NOT_SET",

      gstPercent,

      ...tax,
    };
  });

  const subtotal = Number(cartTotal || 0);

  const gstTotal = taxItems.reduce(
    (a, b) => a + b.gstTotal,
    0
  );

  const cgstTotal = taxItems.reduce(
    (a, b) => a + b.cgst,
    0
  );

  const sgstTotal = taxItems.reduce(
    (a, b) => a + b.sgst,
    0
  );

  const igstTotal = taxItems.reduce(
    (a, b) => a + b.igst,
    0
  );

  const finalAmount =
    subtotal + gstTotal - discount;

  /* ================= UPI ================= */

  const upiLink = `upi://pay?pa=${encodeURIComponent(
    UPI_ID
  )}&pn=${encodeURIComponent(
    UPI_NAME
  )}&am=${Number(finalAmount).toFixed(
    2
  )}&cu=INR`;

  const upiApps = {
    gpay: `tez://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
      2
    )}&cu=INR`,

    phonepe: `phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
      2
    )}&cu=INR`,

    paytm: `paytmmp://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
      2
    )}&cu=INR`,
  };

  /* ================= VERIFY GST ================= */

  const verifyGST = async () => {
    if (!form.gstNumber) return;

    setGstLoading(true);

    try {
      const res = await fetch("/api/gst/verify", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          gstNumber: form.gstNumber,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setGstData(data.data);
      } else {
        setGstData(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGstLoading(false);
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
      alert("Coupon error");
    }
  };

  /* ================= ORDER ================= */

  const handleOrder = async () => {
    try {
      if (
        !form.name ||
        !form.phone ||
        !form.address
      ) {
        alert("Fill all required fields");
        return;
      }

      if (form.pincode?.length !== 6) {
        alert("Invalid pincode");
        return;
      }

      if (!validateGST(form.gstNumber)) {
        alert("Invalid GST Number");
        return;
      }

      if (!safeCart.length) {
        alert("Cart empty");
        return;
      }

      setLoading(true);

      const cleanedCart = safeCart
        .map((item) => {
          const productId =
            item.product?._id ||
            item.productId ||
            item._id;

          if (!productId) return null;

          const qty = Number(item.qty || 1);

          const price = Number(item.price || 0);

          const taxableValue = qty * price;

          const gstPercent = Number(
            item.gstPercent ||
              item.tax ||
              0
          );

          const tax = getGST(
            taxableValue,
            gstPercent,
            isInterState
          );

          return {
            productId,

            name:
              item.name ||
              item.product?.name,

            sku:
              item.sku ||
              item.product?.sku ||
              "",

            hsn:
              item.hsn ||
              item.product?.hsn ||
              "NOT_SET",

            variant:
              item.variant || "default",

            qty,
            price,

            taxableValue,

            gstPercent,

            cgst: tax.cgst,
            sgst: tax.sgst,
            igst: tax.igst,

            gstTotal: tax.gstTotal,

            lineTotal:
              taxableValue +
              tax.gstTotal,
          };
        })
        .filter(Boolean);

      const billing = {
        subtotal,

        discount,

        cgstTotal,

        sgstTotal,

        igstTotal,

        gstTotal,

        grandTotal: finalAmount,

        currency: "INR",

        locked: true,
      };

      const gstType = form.gstNumber
        ? "B2B"
        : "B2C";

      const gstMode = isInterState
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
            source: "SHOP_NATIVE",

            customerType:
              form.gstNumber
                ? "BUSINESS"
                : "INDIVIDUAL",

            cart: cleanedCart,

            billing,

            amount: finalAmount,

            coupon: coupon || null,

            discount,

            paymentMethod,

            taxItems: cleanedCart,

            gstType,

            gstMode,

            address: {
              name: form.name,
              phone: form.phone,
              email: form.email,

              address: form.address,

              city: form.city,
              state: form.state,

              pincode: form.pincode,

              gstNumber:
                form.gstNumber || "",
            },
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Order failed");
        setLoading(false);
        return;
      }

      const orderId = data.orderId;

      /* ================= RAZORPAY ================= */

      if (paymentMethod === "RAZORPAY") {
        if (!window.Razorpay) {
          alert("Razorpay failed");
          setLoading(false);
          return;
        }

        const rzp = new window.Razorpay({
          key:
            process.env
              .NEXT_PUBLIC_RAZORPAY_KEY_ID,

          amount: Math.round(
            finalAmount * 100
          ),

          currency: "INR",

          name: "Native",

          description: "Order Payment",

          order_id:
            data.razorpayOrder?.id,

          prefill: {
            name: form.name,
            contact: form.phone,
            email: form.email,
          },

          handler: async function (
            response
          ) {
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

                    body: JSON.stringify({
                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,

                      orderId,
                    }),
                  }
                );

              const verifyData =
                await verifyRes.json();

              if (verifyData.success) {
                setCart([]);

                closeCart();

                router.push(
                  `/order-success?orderId=${orderId}`
                );
              } else {
                alert(
                  "Payment verification failed"
                );
              }
            } catch (err) {
              console.error(err);
            }
          },

          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },

          theme: {
            color: "#000000",
          },
        });

        rzp.open();

        return;
      }

      /* ================= UPI ================= */

      if (paymentMethod === "UPI") {
        const isMobile =
          /Android|iPhone/i.test(
            navigator.userAgent
          );

        if (isMobile) {
          window.location.href = upiLink;
        }

        setCart([]);
        closeCart();

        router.push(
          `/order-pending?orderId=${orderId}`
        );

        return;
      }

      /* ================= COD ================= */

      if (paymentMethod === "COD") {
        setCart([]);
        closeCart();

        router.push(
          `/order-success?orderId=${orderId}`
        );
      }
    } catch (err) {
      console.error(err);

      alert("Order failed");

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

        {gstLoading && <p>Verifying GST...</p>}

        {gstData && (
          <div className="gstBox">
            GST Verified ✅
          </div>
        )}

        <h4>Payment Method</h4>

        {paymentSettings.razorpay && (
          <label className="paymentOption">
            <input
              type="radio"
              checked={
                paymentMethod ===
                "RAZORPAY"
              }
              onChange={() =>
                setPaymentMethod(
                  "RAZORPAY"
                )
              }
            />

            Razorpay
          </label>
        )}

        {paymentSettings.upi && (
          <label className="paymentOption">
            <input
              type="radio"
              checked={
                paymentMethod === "UPI"
              }
              onChange={() =>
                setPaymentMethod("UPI")
              }
            />

            UPI
          </label>
        )}

        {paymentSettings.cod && (
          <label className="paymentOption">
            <input
              type="radio"
              checked={
                paymentMethod === "COD"
              }
              onChange={() =>
                setPaymentMethod("COD")
              }
            />

            COD
          </label>
        )}

        <div className="coupon">
          <input
            value={coupon}
            onChange={(e) =>
              setCoupon(e.target.value)
            }
            placeholder="Coupon"
          />

          <button onClick={applyCoupon}>
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

        {taxItems.map((item, i) => (
          <div key={i}>
            <div className="row">
              <span>
                {item.name} × {item.qty}
              </span>

              <span>₹{item.base}</span>
            </div>

            <small>
              HSN: {item.hsn} | GST:{" "}
              {item.gstPercent}%
            </small>
          </div>
        ))}

        <hr />

        <div className="row">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        {!isInterState ? (
          <>
            <div className="row">
              <span>CGST</span>
              <span>₹{cgstTotal}</span>
            </div>

            <div className="row">
              <span>SGST</span>
              <span>₹{sgstTotal}</span>
            </div>
          </>
        ) : (
          <div className="row">
            <span>IGST</span>
            <span>₹{igstTotal}</span>
          </div>
        )}

        <div className="row total">
          <b>Total</b>

          <b>
            ₹{finalAmount.toFixed(2)}
          </b>
        </div>

        {paymentMethod === "UPI" && (
          <>
            <QRCode value={upiLink} />

            <a href={upiApps.gpay} className="btn">
              Pay with GPay
            </a>

            <a
              href={upiApps.phonepe}
              className="btn"
            >
              Pay with PhonePe
            </a>

            <a
              href={upiApps.paytm}
              className="btn"
            >
              Pay with Paytm
            </a>
          </>
        )}
      </div>

      <style jsx>{`
        .checkout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .box {
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 20px;
        }

        input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }

        .coupon {
          display: flex;
          gap: 10px;
        }

        button {
          width: 100%;
          padding: 12px;
          background: black;
          color: white;
          border: none;
          cursor: pointer;
        }

        .btn {
          display: block;
          margin-top: 10px;
          padding: 10px;
          text-align: center;
          background: green;
          color: white;
        }

        .paymentOption {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .gstBox {
          background: #f1fff1;
          border: 1px solid #a5d6a7;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .total {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
