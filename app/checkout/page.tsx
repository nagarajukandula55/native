"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://www.angroup.in";

/* =========================================================
   VALIDATIONS
========================================================= */

const validateGST = (gst: string) => {
  if (!gst) return true;

  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gst
  );
};

const validatePhone = (
  phone: string
) => {
  return /^[6-9]\d{9}$/.test(phone);
};

const validateEmail = (
  email: string
) => {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    setCart,
    closeCart,
  } = useCart() as any;

  const razorpayLoaded =
    useRef(false);

  /* =========================================================
     STATES
  ========================================================= */

  const [loading, setLoading] =
    useState(false);

  const [coupon, setCoupon] =
    useState("");

  const [couponData, setCouponData] =
    useState<any>(null);

  const [gstData, setGstData] =
    useState<any>(null);

  const [errors, setErrors] =
    useState<any>({});

  const [orderSummary, setOrderSummary] =
    useState<any>(null);

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
    e: React.ChangeEvent<
      HTMLInputElement
    >
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
            }),
          }
        );

        const data =
          await res.json();

        if (!data.success) {
          alert(data.message);

          setCouponData(null);

          return;
        }

        setCouponData(data);
      } catch (err) {
        console.error(err);
      }
    };

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

    setErrors(newErrors);

    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  };

  /* =========================================================
     PAY
  ========================================================= */

  const handlePay = async () => {
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
        cart.map((item: any) => ({
          productId:
            item.productId ||
            item._id,

          qty: Number(
            item.qty || 1
          ),

          variant:
            item.variant ||
            "default",
        }));

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

      setOrderSummary(data);

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
            },
        },

        theme: {
          color:
            "#111827",
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
    <div className="checkoutWrapper">
      <div className="checkoutGrid">

        <div className="leftBox">
          <div className="card">

            <div className="header">
              <h1>
                Secure Checkout
              </h1>

              <p>
                Enterprise-grade protected payment
              </p>
            </div>

            <div className="section">
              <h3>Customer Details</h3>

              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />

              {errors.name && (
                <p className="error">
                  {errors.name}
                </p>
              )}

              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
              />

              {errors.phone && (
                <p className="error">
                  {errors.phone}
                </p>
              )}

              <input
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="section">
              <h3>
                Delivery Address
              </h3>

              <textarea
                name="address"
                placeholder="Complete Address"
                value={form.address}
                onChange={
                  (e: any) =>
                    handleChange(e)
                }
              />

              <input
                name="landmark"
                placeholder="Landmark"
                value={form.landmark}
                onChange={handleChange}
              />

              <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={handleChange}
              />

              <div className="doubleGrid">
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
              </div>
            </div>

            <div className="section">
              <h3>GST Details</h3>

              <input
                name="gstNumber"
                placeholder="GST Number (Optional)"
                value={form.gstNumber}
                onChange={handleChange}
                onBlur={verifyGST}
              />

              {gstData && (
                <div className="successBox">
                  GST Verified Successfully ✅
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
                  onChange={(e) =>
                    setCoupon(
                      e.target.value
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
            </div>

          </div>
        </div>

        <div className="rightBox">
          <div className="summaryCard">

            <h2>
              Order Summary
            </h2>

            {cart.map(
              (
                item: any,
                i: number
              ) => (
                <div
                  className="item"
                  key={i}
                >
                  <div>
                    <h4>
                      {item.name}
                    </h4>

                    <p>
                      Qty: {item.qty}
                    </p>
                  </div>

                  <div className="price">
                    ₹
                    {Number(
                      item.price *
                        item.qty
                    ).toFixed(2)}
                  </div>
                </div>
              )
            )}

            <div className="summary">

              <div className="summaryRow">
                <span>
                  Total
                </span>

                <span>
                  ₹
                  {Number(
                    orderSummary?.amount ||
                    0
                  ).toFixed(2)}
                </span>
              </div>

            </div>

            <button
              className="payBtn"
              onClick={
                handlePay
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Processing..."
                : "Proceed To Pay"}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
