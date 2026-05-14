"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const SELLER_STATE = "Andhra Pradesh";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://www.angroup.in";

/* =========================================================
   GST
========================================================= */

const getGST = (
  base: number,
  gstPercent = 0,
  isInterState: boolean
) => {
  const gst =
    (Number(base) * Number(gstPercent)) / 100;

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

/* =========================================================
   GST VALIDATION
========================================================= */

const validateGST = (gst: string) => {
  if (!gst) return true;

  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gst
  );
};

/* =========================================================
   PHONE VALIDATION
========================================================= */

const validatePhone = (
  phone: string
) => {
  return /^[6-9]\d{9}$/.test(phone);
};

/* =========================================================
   EMAIL VALIDATION
========================================================= */

const validateEmail = (
  email: string
) => {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

/* =========================================================
   SAFE NUMBER
========================================================= */

const safeNumber = (v: any) => {
  const n = Number(v);

  return isNaN(n) ? 0 : n;
};

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    cartTotal,
    setCart,
    closeCart,
  } = useCart();

  const razorpayLoaded =
    useRef(false);

  /* =========================================================
     STATES
  ========================================================= */

  const [loading, setLoading] =
    useState(false);

  const [coupon, setCoupon] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [couponData, setCouponData] =
    useState<any>(null);

  const [gstData, setGstData] =
    useState<any>(null);

  const [enrichedCart, setEnrichedCart] =
    useState<any[]>([]);

  const [errors, setErrors] =
    useState<any>({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    gstNumber: "",
  });

  /* =========================================================
     LOAD RAZORPAY
  ========================================================= */

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.Razorpay
    ) {
      razorpayLoaded.current = true;
      return;
    }

    const existing =
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

    if (existing) return;

    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      razorpayLoaded.current = true;
    };

    document.body.appendChild(script);
  }, []);

  /* =========================================================
     ENRICH CART
  ========================================================= */

  useEffect(() => {
    if (!cart?.length) return;

    let mounted = true;

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

        const data =
          await res.json();

        if (
          mounted &&
          data.success &&
          Array.isArray(data.cart)
        ) {
          setEnrichedCart(data.cart);
        }
      } catch (err) {
        console.error(err);
      }
    };

    enrichCart();

    return () => {
      mounted = false;
    };
  }, [cart]);

  /* =========================================================
     PINCODE AUTO FETCH
  ========================================================= */

  useEffect(() => {
    if (form.pincode?.length !== 6)
      return;

    let mounted = true;

    const fetchLocation =
      async () => {
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${form.pincode}`
          );

          const data =
            await res.json();

          if (
            mounted &&
            data?.[0]?.Status ===
              "Success"
          ) {
            const po =
              data[0]
                .PostOffice?.[0];

            setForm((prev) => ({
              ...prev,
              city:
                po?.District || "",
              state:
                po?.State || "",
            }));
          }
        } catch (err) {
          console.error(err);
        }
      };

    fetchLocation();

    return () => {
      mounted = false;
    };
  }, [form.pincode]);

  /* =========================================================
     INPUT
  ========================================================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================================================
     GST VERIFY
  ========================================================= */

  const verifyGST = async () => {
    if (!form.gstNumber) {
      setGstData(null);
      return;
    }

    if (
      !validateGST(
        form.gstNumber
      )
    ) {
      setErrors((prev: any) => ({
        ...prev,
        gstNumber:
          "Invalid GST Number",
      }));

      return;
    }

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

      const data =
        await res.json();

      if (data.success) {
        setGstData(data.data);
      } else {
        setGstData(null);

        setErrors((prev: any) => ({
          ...prev,
          gstNumber:
            data.message ||
            "GST verification failed",
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================================================
     COUPON
  ========================================================= */

  const applyCoupon =
    async () => {
      if (!coupon) return;

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

        const data =
          await res.json();

        if (!data.success) {
          alert(data.message);

          setDiscount(0);
          setCouponData(null);

          return;
        }

        setDiscount(
          Number(
            data.discount || 0
          )
        );

        setCouponData(data);
      } catch (err) {
        console.error(err);
      }
    };

  /* =========================================================
     SAFE CART
  ========================================================= */

  const safeCart =
    enrichedCart?.length
      ? enrichedCart
      : cart || [];

  /* =========================================================
     GST MODE
  ========================================================= */

  const isInterState =
    form.state &&
    form.state !==
      SELLER_STATE;

  /* =========================================================
     TAX ITEMS
  ========================================================= */

  const taxItems = useMemo(() => {
    return safeCart.map(
      (item) => {
        const base =
          safeNumber(
            item.price
          ) *
          safeNumber(item.qty);

        const gstPercent =
          safeNumber(
            item.gstPercent ||
              item.tax ||
              0
          );

        const tax = getGST(
          base,
          gstPercent,
          Boolean(
            isInterState
          )
        );

        return {
          ...item,

          base,

          gstPercent,

          ...tax,
        };
      }
    );
  }, [
    safeCart,
    isInterState,
  ]);

  /* =========================================================
     TOTALS
  ========================================================= */

  const subtotal =
    safeNumber(cartTotal);

  const gstTotal =
    taxItems.reduce(
      (a, b) =>
        a +
        safeNumber(
          b.gstTotal
        ),
      0
    );

  const cgstTotal =
    taxItems.reduce(
      (a, b) =>
        a +
        safeNumber(b.cgst),
      0
    );

  const sgstTotal =
    taxItems.reduce(
      (a, b) =>
        a +
        safeNumber(b.sgst),
      0
    );

  const igstTotal =
    taxItems.reduce(
      (a, b) =>
        a +
        safeNumber(b.igst),
      0
    );

  const finalAmount =
    Math.max(
      0,
      subtotal +
        gstTotal -
        safeNumber(
          discount
        )
    );

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const newErrors: any =
      {};

    if (!form.name)
      newErrors.name =
        "Name required";

    if (
      !validatePhone(
        form.phone
      )
    ) {
      newErrors.phone =
        "Invalid mobile number";
    }

    if (
      !validateEmail(
        form.email
      )
    ) {
      newErrors.email =
        "Invalid email";
    }

    if (!form.address)
      newErrors.address =
        "Address required";

    if (
      form.pincode?.length !==
      6
    ) {
      newErrors.pincode =
        "Invalid pincode";
    }

    if (
      !validateGST(
        form.gstNumber
      )
    ) {
      newErrors.gstNumber =
        "Invalid GST Number";
    }

    setErrors(newErrors);

    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  };

  /* =========================================================
     ORDER
  ========================================================= */

  const handleOrder =
    async () => {
      if (!validateForm())
        return;

      if (
        !razorpayLoaded.current
      ) {
        alert(
          "Payment gateway loading..."
        );

        return;
      }

      try {
        setLoading(true);

        const cleanedCart =
          safeCart.map(
            (item) => ({
              productId:
                item.productId ||
                item._id,

              qty: item.qty,

              variant:
                item.variant ||
                "default",
            })
          );

        const res =
          await fetch(
            `${API_BASE}/api/orders/create`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    cart: cleanedCart,

                    address:
                      form,

                    coupon,

                    paymentMethod:
                      "RAZORPAY",
                  }
                ),
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

        const options = {
          key:
            process.env
              .NEXT_PUBLIC_RAZORPAY_KEY_ID,

          amount:
            data
              .razorpayOrder
              .amount,

          currency:
            data
              .razorpayOrder
              .currency,

          name: "Native",

          description:
            "Secure Checkout",

          order_id:
            data
              .razorpayOrder
              .id,

          prefill: {
            name: form.name,
            contact:
              form.phone,
            email:
              form.email,
          },

          notes: {
            orderId:
              data.orderId,
          },

          handler:
            async function (
              response: any
            ) {
              try {
                const verifyRes =
                  await fetch(
                    `${API_BASE}/api/payment/verify`,
                    {
                      method:
                        "POST",

                      headers:
                        {
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
                    verifyData.message ||
                      "Payment verification failed"
                  );
                }
              } catch (err) {
                console.error(
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
                setLoading(
                  false
                );

                alert(
                  "Payment cancelled. If amount debited please contact support."
                );
              },
          },

          theme: {
            color:
              "#111827",
          },
        };

        const rzp =
          new (
            window as any
          ).Razorpay(
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
    <div className="checkoutWrapper">
      <div className="checkoutGrid">
        {/* =========================================================
            LEFT
        ========================================================= */}

        <div className="leftBox">
          <div className="card">
            <div className="header">
              <h1>
                Secure Checkout
              </h1>

              <p>
                Enterprise-grade
                protected payment
              </p>
            </div>

            <div className="section">
              <h3>
                Customer Details
              </h3>

              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={
                  handleChange
                }
              />

              {errors.name && (
                <p className="error">
                  {
                    errors.name
                  }
                </p>
              )}

              <input
                name="phone"
                placeholder="Phone Number"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
              />

              {errors.phone && (
                <p className="error">
                  {
                    errors.phone
                  }
                </p>
              )}

              <input
                name="email"
                placeholder="Email Address"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
              />

              {errors.email && (
                <p className="error">
                  {
                    errors.email
                  }
                </p>
              )}
            </div>

            <div className="section">
              <h3>
                Delivery Address
              </h3>

              <textarea
                name="address"
                placeholder="Complete Address"
                value={
                  form.address
                }
                onChange={
                  (
                    e: any
                  ) =>
                    handleChange(
                      e
                    )
                }
              />

              {errors.address && (
                <p className="error">
                  {
                    errors.address
                  }
                </p>
              )}

              <input
                name="landmark"
                placeholder="Landmark"
                value={
                  form.landmark
                }
                onChange={
                  handleChange
                }
              />

              <input
                name="pincode"
                placeholder="Pincode"
                value={
                  form.pincode
                }
                onChange={
                  handleChange
                }
              />

              {errors.pincode && (
                <p className="error">
                  {
                    errors.pincode
                  }
                </p>
              )}

              <div className="doubleGrid">
                <input
                  value={
                    form.city
                  }
                  disabled
                  placeholder="City"
                />

                <input
                  value={
                    form.state
                  }
                  disabled
                  placeholder="State"
                />
              </div>
            </div>

            <div className="section">
              <h3>
                GST Details
              </h3>

              <input
                name="gstNumber"
                placeholder="GST Number (Optional)"
                value={
                  form.gstNumber
                }
                onChange={
                  handleChange
                }
                onBlur={
                  verifyGST
                }
              />

              {errors.gstNumber && (
                <p className="error">
                  {
                    errors.gstNumber
                  }
                </p>
              )}

              {gstData && (
                <div className="successBox">
                  GST Verified
                  Successfully ✅
                </div>
              )}
            </div>

            <div className="section">
              <h3>
                Apply Coupon
              </h3>

              <div className="couponRow">
                <input
                  value={coupon}
                  onChange={(
                    e
                  ) =>
                    setCoupon(
                      e.target
                        .value
                    )
                  }
                  placeholder="Coupon Code"
                />

                <button
                  className="couponBtn"
                  onClick={
                    applyCoupon
                  }
                >
                  Apply
                </button>
              </div>

              {couponData && (
                <div className="successBox">
                  Coupon Applied
                  Successfully ✅
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT
        ========================================================= */}

        <div className="rightBox">
          <div className="summaryCard">
            <h2>
              Order Summary
            </h2>

            <div className="items">
              {taxItems.map(
                (
                  item,
                  i
                ) => (
                  <div
                    className="item"
                    key={i}
                  >
                    <div>
                      <h4>
                        {
                          item.name
                        }
                      </h4>

                      <p>
                        Qty:{" "}
                        {
                          item.qty
                        }
                      </p>

                      <p>
                        GST:{" "}
                        {
                          item.gstPercent
                        }
                        %
                      </p>
                    </div>

                    <div className="price">
                      ₹
                      {item.base.toFixed(
                        2
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="summary">
              <div className="summaryRow">
                <span>
                  Subtotal
                </span>

                <span>
                  ₹
                  {subtotal.toFixed(
                    2
                  )}
                </span>
              </div>

              {!isInterState ? (
                <>
                  <div className="summaryRow">
                    <span>
                      CGST
                    </span>

                    <span>
                      ₹
                      {cgstTotal.toFixed(
                        2
                      )}
                    </span>
                  </div>

                  <div className="summaryRow">
                    <span>
                      SGST
                    </span>

                    <span>
                      ₹
                      {sgstTotal.toFixed(
                        2
                      )}
                    </span>
                  </div>
                </>
              ) : (
                <div className="summaryRow">
                  <span>
                    IGST
                  </span>

                  <span>
                    ₹
                    {igstTotal.toFixed(
                      2
                    )}
                  </span>
                </div>
              )}

              {discount >
                0 && (
                <div className="summaryRow success">
                  <span>
                    Discount
                  </span>

                  <span>
                    - ₹
                    {discount.toFixed(
                      2
                    )}
                  </span>
                </div>
              )}

              <div className="grandTotal">
                <span>
                  Grand Total
                </span>

                <span>
                  ₹
                  {finalAmount.toFixed(
                    2
                  )}
                </span>
              </div>
            </div>

            <button
              className="payBtn"
              onClick={
                handleOrder
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Processing..."
                : `Pay ₹${finalAmount.toFixed(
                    2
                  )}`}
            </button>

            <div className="secureNote">
              🔒 Secure
              enterprise-grade
              payment protected
              by Razorpay
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkoutWrapper {
          min-height: 100vh;
          background: #f8fafc;
          padding: 40px 20px;
        }

        .checkoutGrid {
          max-width: 1400px;
          margin: auto;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 30px;
          align-items: start;
        }

        .card,
        .summaryCard {
          background: white;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
        }

        .header h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .header p {
          color: #64748b;
          margin-bottom: 30px;
        }

        .section {
          margin-bottom: 30px;
        }

        .section h3 {
          margin-bottom: 16px;
          font-size: 18px;
        }

        input,
        textarea {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid #dbe2ea;
          margin-bottom: 12px;
          font-size: 15px;
          transition: 0.2s;
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #111827;
        }

        .doubleGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .couponRow {
          display: flex;
          gap: 10px;
        }

        .couponBtn {
          width: 120px;
        }

        .payBtn,
        .couponBtn {
          border: none;
          background: #111827;
          color: white;
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }

        .payBtn:hover,
        .couponBtn:hover {
          opacity: 0.92;
        }

        .payBtn {
          width: 100%;
          margin-top: 20px;
          font-size: 16px;
        }

        .summaryCard h2 {
          margin-bottom: 24px;
        }

        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-bottom: 18px;
          border-bottom: 1px solid #eef2f7;
        }

        .item h4 {
          margin-bottom: 6px;
        }

        .item p {
          color: #64748b;
          font-size: 14px;
        }

        .price {
          font-weight: bold;
        }

        .summary {
          margin-top: 20px;
        }

        .summaryRow,
        .grandTotal {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .grandTotal {
          font-size: 20px;
          font-weight: bold;
          border-top: 1px solid #e2e8f0;
          padding-top: 18px;
          margin-top: 18px;
        }

        .success {
          color: #16a34a;
        }

        .error {
          color: #dc2626;
          margin-top: -6px;
          margin-bottom: 12px;
          font-size: 13px;
        }

        .successBox {
          background: #ecfdf5;
          color: #166534;
          border: 1px solid #bbf7d0;
          padding: 14px;
          border-radius: 14px;
          font-size: 14px;
        }

        .secureNote {
          margin-top: 18px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .checkoutGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .checkoutWrapper {
            padding: 20px 12px;
          }

          .card,
          .summaryCard {
            padding: 20px;
          }

          .doubleGrid {
            grid-template-columns: 1fr;
          }

          .couponRow {
            flex-direction: column;
          }

          .couponBtn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
