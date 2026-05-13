"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "nraj.k55@ybl";
const UPI_NAME = "Native";
const SELLER_STATE = "Andhra Pradesh";

/* ================= GST ================= */
const getGST = (base, gstPercent = 0, isInterState) => {
  const gst = (base * gstPercent) / 100;

  if (isInterState) {
    return { igst: gst, cgst: 0, sgst: 0, gstTotal: gst };
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
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, setCart, closeCart } = useCart();

  const [paymentSettings, setPaymentSettings] = useState({
    razorpay: true,
    cod: true,
    upi: true,
  });
  
  const [gstData, setGstData] = useState(null);
  const [gstLoading, setGstLoading] = useState(false);
  const [enrichedCart, setEnrichedCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    gstNumber: "", // ✅ added back
  });

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  /* ===================       ================= */

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
          cod: data.settings?.cod,
          upi: data.settings?.upi,
        });
      }
  
    } catch (err) {
  
      console.log(
        "PAYMENT SETTINGS ERROR",
        err
      );
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ================= CART ENRICHMENT ================= */
  useEffect(() => {
    const enrichCart = async () => {
      try {
        const res = await fetch("/api/cart/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        });

        const data = await res.json();

        if (data?.success && Array.isArray(data.cart)) {
          setEnrichedCart(data.cart);
        } else {
          setEnrichedCart(cart || []);
        }
      } catch (err) {
        console.error("Enrich error:", err);
        setEnrichedCart(cart || []);
      }
    };

    if (cart?.length) enrichCart();
    else setEnrichedCart([]);
  }, [cart]);

  /* ================= PINCODE AUTO ================= */
  useEffect(() => {
    if (form.pincode?.length !== 6) return;

    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${form.pincode}`
        );
        const data = await res.json();

        if (data?.[0]?.Status === "Success") {
          const po = data[0].PostOffice?.[0];

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

    const t = setTimeout(fetchLocation, 400);
    return () => clearTimeout(t);
  }, [form.pincode]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= COUPON ================= */
  const applyCoupon = async () => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon, cartTotal }),
      });

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

  /* ================= SAFE CART ================= */
  const safeCart =
    Array.isArray(enrichedCart) && enrichedCart.length
      ? enrichedCart
      : Array.isArray(cart)
      ? cart
      : [];

  const isInterState = form.state && form.state !== SELLER_STATE;

  const taxItems = safeCart.map((item) => {
    const base = item.price * item.qty;

    const hsn = item.hsn || item.product?.hsn || "NOT_SET";
    const gstPercent = item.gstPercent || item.tax || 0;

    const tax = getGST(base, gstPercent, isInterState);

    return {
      ...item,
      base,
      hsn,
      gstPercent,
      ...tax,
    };
  });

  const subtotal = cartTotal || 0;

  const gstTotal = taxItems.reduce((a, b) => a + b.gstTotal, 0);
  const cgstTotal = taxItems.reduce((a, b) => a + b.cgst, 0);
  const sgstTotal = taxItems.reduce((a, b) => a + b.sgst, 0);
  const igstTotal = taxItems.reduce((a, b) => a + b.igst, 0);

  const finalAmount = subtotal + gstTotal - discount;

  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    UPI_NAME
  )}&am=${Number(finalAmount).toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    "Order Payment"
  )}`;

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

  const verifyGST = async () => {
    if (!form.gstNumber) return;

    setGstLoading(true);

    try {
      const res = await fetch("/api/gst/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gstNumber: form.gstNumber,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setGstData(data.data);

        setForm((prev) => ({
          ...prev,
          gstVerified: true,
        }));
      } else {
        setGstData(null);
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("GST verification failed");
    } finally {
      setGstLoading(false);
    }
  };

  /* ================= ORDER ================= */
const handleOrder = async () => {
  if (!form.name || !form.phone || !form.address) {
    alert("Please fill all required details");
    return;
  }

  if (!safeCart.length) {
    alert("Cart is empty");
    return;
  }

  if (!validateGST(form.gstNumber)) {
    alert("Invalid GST Number");
    return;
  }

  if (form.pincode?.length !== 6) {
    alert("Invalid Pincode");
    return;
  }

  try {
    setLoading(true);

    /* ================= CLEAN CART ================= */

        const cleanedCart = safeCart
          .map((item) => {
            const productId =
              item.product?._id ||
              item.productId ||
              item._id;
    
            if (!productId) {
              console.error("Missing Product ID", item);
              return null;
            }
    
            const qty = Number(item.qty || 1);
            const price = Number(item.price || 0);
    
            const base = qty * price;
    
            const gstPercent =
              Number(item.gstPercent || item.tax || 0);
    
            const tax = getGST(
              base,
              gstPercent,
              isInterState
            );
    
            return {
              productId,
    
              name:
                item.name ||
                item.product?.name ||
                "",
    
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
    
              taxableValue: base,
    
              gstPercent,
    
              cgst: tax.cgst,
              sgst: tax.sgst,
              igst: tax.igst,
    
              gstTotal: tax.gstTotal,
    
              lineTotal:
                base + tax.gstTotal,
            };
          })
          .filter(Boolean);
    
        if (!cleanedCart.length) {
          alert("Invalid cart");
          return;
        }
    
        /* ================= ENTERPRISE BILLING ================= */
    
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
    
        /* ================= GST MODE ================= */
    
        const gstType = form.gstNumber
          ? "B2B"
          : "B2C";
    
        const gstMode = isInterState
          ? "IGST"
          : "CGST_SGST";
    
        /* ================= API ================= */
    
        const res = await fetch(
          "https://www.angroup.in/api/orders/create",
          {
            method: "POST",
    
            headers: {
              "Content-Type": "application/json",
            },
    
            body: JSON.stringify({
              source: "SHOP_NATIVE",
    
              customerType:
                form.gstNumber
                  ? "BUSINESS"
                  : "INDIVIDUAL",
    
              cart: cleanedCart,
    
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
    
              amount: finalAmount,
    
              billing,
    
              coupon: coupon || null,
    
              discount,
    
              paymentMethod,
    
              taxItems: cleanedCart,
    
              gstType,
    
              gstMode,
            }),
          }
        );
    
        const data = await res.json();
    
        console.log("ORDER RESPONSE", data);
    
        if (!data.success) {
          alert(data.message || "Order failed");
          setLoading(false);
          return;
        }
    
        const orderId = data.orderId;
    
        /* ================= RAZORPAY ================= */
    
        if (paymentMethod === "RAZORPAY") {
          if (!data.razorpayOrder) {
            alert("Razorpay unavailable");
            setLoading(false);
            return;
          }
    
          if (!window.Razorpay) {
            alert("Payment gateway failed to load");
            setLoading(false);
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
    
            description: "Order Payment",
    
            order_id:
              data.razorpayOrder.id,
    
            prefill: {
              name: form.name,
              contact: form.phone,
              email: form.email,
            },
    
            notes: {
              orderId,
            },
    
            theme: {
              color: "#000000",
            },
    
            modal: {
              ondismiss: function () {
                setLoading(false);
              },
            },
    
            handler: async function (
              response
            ) {
              try {
                const verifyRes = await fetch(
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
    
                  setLoading(false);
                }
              } catch (err) {
                console.error(err);
    
                alert(
                  "Payment verification error"
                );
    
                setLoading(false);
              }
            },
          };
    
          const rzp =
            new window.Razorpay(options);
    
          rzp.on(
            "payment.failed",
            function (response) {
              console.error(
                response.error
              );
    
              alert("Payment Failed");
    
              setLoading(false);
            }
          );
    
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
            window.location.href =
              upiLink;
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
    
          return;
        }
      } catch (err) {
        console.error(err);
    
        alert("Order failed");
    
        setLoading(false);
      }
  
        {gstData && (
          <div className="gstBox">
            <strong>GST Format Verified ✅</strong>
  
            <div className="gstRow">
              <span>State:</span>
              <span>{gstData.state || gstData.pradr?.addr?.st || "N/A"}</span>
            </div>
  
            <div className="gstRow">
              <span>State Code:</span>
              <span>{gstData.stateCode}</span>
            </div>
  
            <div className="gstRow">
              <span>GSTIN:</span>
              <span>{form.gstNumber}</span>
            </div>
          </div>
        )}
  
        {/* ✅ COUPON */}
        <div className="coupon">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Coupon"
          />
          <button onClick={applyCoupon}>Apply</button>
        </div>
  
        <button onClick={handleOrder} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${finalAmount.toFixed(2)}`}
        </button>
      </div>
  
      {/* ================= SUMMARY ================= */}
      <div className="box">
        <h3>Order Summary</h3>
  
        {taxItems.map((item, i) => (
          <div key={i}>
            <div className="row">
              <span>
                {item.name} x {item.qty}
              </span>
              <span>₹{item.base}</span>
            </div>
  
            <small>
              HSN: {item.hsn} | GST: {item.gstPercent}%
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
          <b>₹{finalAmount}</b>
        </div>
  
        {/* ================= UPI ================= */}
        {paymentMethod === "UPI" && (
          <>
            <div>
              {finalAmount > 0 && <QRCode value={upiLink} />}
  
              <a
                href={upiLink}
                className="btn"
                onClick={(e) => {
                  const isMobile = /Android|iPhone/i.test(navigator.userAgent);
                  if (!isMobile) {
                    e.preventDefault();
                    alert("Open this on your mobile to complete payment 📱");
                  }
                }}
              >
                Open UPI App
              </a>
            </div>
  
            <div style={{ marginTop: 10 }}>
              <a href={upiApps.gpay} className="btn">
                Pay with GPay
              </a>
              <a href={upiApps.phonepe} className="btn">
                Pay with PhonePe
              </a>
              <a href={upiApps.paytm} className="btn">
                Pay with Paytm
              </a>
            </div>
          </>
        )}
      </div>
  
      {/* ================= STYLES ================= */}
      <style jsx>{`
        .checkout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
  
        .box {
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 12px;
        }
  
        input {
          width: 100%;
          padding: 10px;
          margin: 5px 0;
        }
  
        .row {
          display: flex;
          justify-content: space-between;
        }
  
        .coupon {
          display: flex;
          gap: 10px;
        }
  
        button {
          width: 100%;
          padding: 10px;
          background: black;
          color: white;
        }
  
        .btn {
          display: block;
          margin-top: 10px;
          background: green;
          color: white;
          padding: 10px;
          text-align: center;
        }
  
        .gstBox {
          margin-top: 10px;
          padding: 10px;
          background: #f1fff1;
          border: 1px solid #b6e3b6;
          border-radius: 8px;
          font-size: 13px;
        }
  
        .gstRow {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
