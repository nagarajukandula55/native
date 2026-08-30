"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { pincode } from "@/lib/an-sdk";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { verifyGst } from "@/lib/an-sdk/gst";
import { validateCoupon } from "@/lib/an-sdk/coupons";
import { createOrder } from "@/lib/an-sdk/orders";
import { verifyPayment } from "@/lib/an-sdk/payments";
import { getMe, isLoggedIn } from "@/lib/an-sdk/auth";
import {
  getSavedAddresses,
  addSavedAddress,
  type SavedAddress,
} from "@/lib/an-sdk/addresses";
import { getStoredPincode, setStoredPincode } from "@/lib/pincode";
import {
  MIN_ORDER_VALUE,
  FREE_SHIPPING_THRESHOLD,
  SMALL_CART_FEE,
  DELIVERY_CHARGE,
} from "@/lib/constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/* =========================================================
   VALIDATIONS
========================================================= */

const validateGST = (gst: string) => {
  if (!gst) return true;

  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gst
  );
};

const validatePhone = (phone: string) => {
  return /^[6-9]\d{9}$/.test(phone);
};

const validateEmail = (email: string) => {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

const safeNumber = (v: any) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    setCart,
    closeCart,
  } = useCart() as any;

  const razorpayLoaded = useRef(false);

  /* =========================================================
     STATES
  ========================================================= */

  const [loading, setLoading] = useState(false);

  // Set once an order is actually created server-side (with a Razorpay
  // order attached) and cleared only on success -- so a failed/cancelled
  // Razorpay checkout retries against the SAME order instead of calling
  // createOrder() again. Was re-running createOrder() from scratch on
  // every retry (verify failure, thrown error, or the customer dismissing
  // the Razorpay modal), creating a brand-new order each time; the
  // previous attempt's order was left orphaned with no way back to it.
  const [pendingOrder, setPendingOrder] = useState<{ orderId: string; razorpayOrder: any } | null>(null);

  const [coupon, setCoupon] = useState("");

  const [couponData, setCouponData] = useState<any>(null);

  const [gstData, setGstData] = useState<any>(null);

  // Saved address book (logged-in customers only -- see lib/an-sdk/addresses.ts).
  // savedAddresses stays empty for guests, who just type a fresh address as
  // before; nothing here blocks or requires login.
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  // "picker" once a saved address is chosen/available, "new" while typing a
  // fresh one (default for guests, and for a logged-in customer with no
  // saved addresses yet).
  const [addressMode, setAddressMode] = useState<"picker" | "new">("new");
  const [saveThisAddress, setSaveThisAddress] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const [orderSummary, setOrderSummary] = useState<any>({
    items: [],
  });

  const [summary, setSummary] = useState({
    subtotal: 0,
    subtotalBeforeTax: 0,
    discount: 0,
    taxableAmount: 0,
    gstTotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    smallCartFee: 0,
    deliveryCharge: 0,
    grandTotal: 0,
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    // Prefill from whatever pincode the customer already gave us while
    // browsing (see components/PincodeBar.jsx / lib/pincode.ts) -- avoids
    // asking twice.
    pincode: typeof window !== "undefined" ? getStoredPincode() : "",
    city: "",
    state: "",
    gstNumber: "",
  });

  /* =========================================================
     AUTOFILL FROM PROFILE (logged-in convenience only — guests
     are never blocked or required to log in; this just saves a
     logged-in customer from retyping their own details).
  ========================================================= */

  useEffect(() => {
    if (!isLoggedIn()) return;

    let cancelled = false;

    getMe().then((me: any) => {
      if (cancelled || !me) return;
      setForm((prev) => ({
        ...prev,
        name: prev.name || me.name || "",
        phone: prev.phone || me.phone || "",
        email: prev.email || me.email || "",
      }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     SAVED ADDRESSES (logged-in only)
  ========================================================= */

  useEffect(() => {
    if (!isLoggedIn()) return;

    let cancelled = false;

    getSavedAddresses()
      .then((addresses) => {
        if (cancelled) return;

        setSavedAddresses(addresses);

        if (addresses.length > 0) {
          setAddressMode("picker");

          const preferred =
            addresses.find((a) => a.isDefault) || addresses[0];

          setSelectedAddressId(preferred._id);

          setForm((prev) => ({
            ...prev,
            address: [preferred.line1, preferred.line2].filter(Boolean).join(", "),
            city: preferred.city || prev.city,
            state: preferred.state || prev.state,
            pincode: preferred.pincode || prev.pincode,
            phone: prev.phone || preferred.phone || "",
          }));
        }
      })
      .catch((err) => {
        // Non-blocking -- same reasoning as the profile-autofill effect
        // above: a failed lookup just leaves the customer typing a fresh
        // address, never blocks checkout.
        console.error("SAVED ADDRESSES FETCH ERROR:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const applySavedAddress = (id: string) => {
    setSelectedAddressId(id);
    const addr = savedAddresses.find((a) => a._id === id);
    if (!addr) return;

    setForm((prev) => ({
      ...prev,
      address: [addr.line1, addr.line2].filter(Boolean).join(", "),
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      phone: prev.phone || addr.phone || "",
    }));
  };

  /* =========================================================
     LOAD RAZORPAY
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.Razorpay) {
      razorpayLoaded.current = true;
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      razorpayLoaded.current = true;
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      razorpayLoaded.current = true;
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  /* =========================================================
     PINCODE AUTO FETCH
  ========================================================= */

useEffect(() => {
  if (
    form.pincode.length !== 6
  ) {
    return;
  }

  // Snapshot the pincode this effect instance is resolving. Previously the
  // async callback re-read `form.pincode` from the enclosing closure, which
  // is fine for guarding against an UNMOUNTED effect (the `mounted` flag)
  // but did nothing to guard against a STALE-but-still-mounted one: on
  // re-entry (clear pincode A, type pincode B) both effect instances stay
  // mounted the whole time -- nothing ever unmounts the component -- so
  // `mounted` was always true and a slow response for A could still land
  // and overwrite city/state AFTER B had already been typed, if A's request
  // happened to resolve after B's. Comparing against this captured
  // `requestedPincode` (instead of the live, possibly-already-changed
  // `form.pincode`) ensures a response only ever applies when it's still
  // the answer to the most recent request.
  const requestedPincode = form.pincode;
  let cancelled = false;

  // Clear any city/state left over from a previous pincode immediately, so
  // re-entering a new pincode never shows stale data while the new lookup
  // is in flight (or if it fails / comes back not-found).
  setForm((prev) =>
    prev.city || prev.state
      ? { ...prev, city: "", state: "" }
      : prev
  );

    const fetchLocation =
    async () => {
      try {
        const data = await pincode.lookupPincode(requestedPincode);

        console.log(
          "PINCODE DATA:",
          data
        );

        if (
          !cancelled &&
          data?.success
        ) {
          setForm((prev) => ({
            ...prev,

            city:
              data.city || "",

            state:
              data.state || "",
          }));
        }

        // Keep the shared pincode store (used for pincode-aware browsing
        // on the home page) in sync with whatever the customer enters here,
        // regardless of whether the lookup itself succeeded.
        setStoredPincode(requestedPincode);

      } catch (err) {
        console.error(
          "PINCODE FETCH ERROR:",
          err
        );
      }
    };
  fetchLocation();

  return () => {
    cancelled = true;
  };

}, [form.pincode]);
  
  /* =========================================================
     INPUT
  ========================================================= */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

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

    if (!validateGST(form.gstNumber)) {
      setErrors((prev: any) => ({
        ...prev,
        gstNumber: "Invalid GST Number",
      }));
      return;
    }

    try {
      const data = await verifyGst(form.gstNumber);

      if (data.success) {
        setGstData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================================================
     APPLY COUPON
  ========================================================= */

  const applyCoupon = async () => {
    if (!coupon) return;

    try {
      // Was fetch("/api/coupons/validate", ...) -- a relative path with no
      // local route behind it (this app has no app/api directory at all),
      // so this always 404'd. The real route lives on the ANgroup backend;
      // validateCoupon() routes there via the shared SDK client, which
      // already attaches businessId the same way every other data call
      // here does.
      const subtotal = cart.reduce(
        (acc: number, item: any) =>
          acc +
          safeNumber(item.price) *
            safeNumber(item.qty),
        0
      );

      const data: any = await validateCoupon(coupon, subtotal);

      // ANgroup's real route returns {valid, discount, finalAmount, coupon}
      // on success or {valid: false, reason} on failure -- was checking
      // data.success/data.message, fields that route never sends, so a
      // valid coupon would still show "undefined" and fail here.
      if (!data.valid) {
        alert(data.reason || "Invalid coupon");
        setCouponData(null);
        return;
      }

      setCouponData(data);
    } catch (err) {
      console.error(err);
      alert("Failed to apply coupon");
    }
  };

    /* =========================================================
       SUMMARY (LOCAL PREVIEW ONLY)
    ========================================================= */
      
      const displaySummary = useMemo(() => {
        if (summary.grandTotal > 0) {
          return summary;
        }

        // `item.price` is GST-INCLUSIVE (see CartContext.tsx) -- the base/
        // taxable value is derived by backing the tax out: base =
        // price / (1 + gstPercent/100). Summed across the cart this gives a
        // true subtotal-before-tax instead of just re-summing the
        // tax-inclusive line prices.
        let subtotalBeforeTax = 0;
        let gstTotal = 0;
        const subtotal = cart.reduce(
          (acc: number, item: any) =>
            acc +
            safeNumber(item.price) *
              safeNumber(item.qty),
          0
        );

        cart.forEach((item: any) => {
          const lineTotal =
            safeNumber(item.price) * safeNumber(item.qty);
          const gstPercent = safeNumber(item.gstPercent);
          const lineBase = lineTotal / (1 + gstPercent / 100);
          const lineGst = lineTotal - lineBase;

          subtotalBeforeTax += lineBase;
          gstTotal += lineGst;
        });

        const discount = safeNumber(
          couponData?.discount
        );

        const discountedTotal = Math.max(
          0,
          subtotal - discount
        );

        // Small-cart fee + delivery charge apply based on the (pre-tax-
        // adjustment) cart subtotal, waived once it reaches the free-
        // shipping threshold. See lib/constants.ts -- both are tunable and
        // meant to eventually move to an admin-configurable setting.
        const belowFreeShippingThreshold =
          subtotal < FREE_SHIPPING_THRESHOLD;
        const smallCartFee = belowFreeShippingThreshold
          ? SMALL_CART_FEE
          : 0;
        const deliveryCharge = belowFreeShippingThreshold
          ? DELIVERY_CHARGE
          : 0;

        return {
          subtotal,
          subtotalBeforeTax,
          discount,
          gstTotal,
          smallCartFee,
          deliveryCharge,
          grandTotal:
            discountedTotal +
            smallCartFee +
            deliveryCharge,
        };
      }, [summary, cart, couponData]);

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.name) newErrors.name = "Name required";

    if (!validatePhone(form.phone)) {
      newErrors.phone = "Invalid mobile number";
    }

    if (!validateEmail(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!form.address) newErrors.address = "Address required";

    if (form.pincode.length !== 6) {
      newErrors.pincode = "Invalid pincode";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     PAY
  ========================================================= */
    
    const handlePay = async () => {
      if (!validateForm()) return;

      // Defense-in-depth: the cart page already blocks "Proceed to Checkout"
      // below the minimum, but a stale cart state or direct navigation to
      // /checkout could still land here under the threshold, so re-check
      // before placing the order.
      if (displaySummary.subtotal < MIN_ORDER_VALUE) {
        alert(
          `Add ₹${(MIN_ORDER_VALUE - displaySummary.subtotal).toFixed(2)} more to reach the ₹${MIN_ORDER_VALUE} minimum order value`
        );
        return;
      }

      if (!razorpayLoaded.current) {
        alert("Payment gateway loading...");
        return;
      }
    
      try {
        setLoading(true);

        let orderId: string;
        let razorpayOrder: any;

        if (pendingOrder) {
          // Retrying after a failed/cancelled Razorpay checkout -- reuse
          // the order already created server-side instead of creating a
          // new one.
          orderId = pendingOrder.orderId;
          razorpayOrder = pendingOrder.razorpayOrder;
        } else {
          const cleanedCart = cart
            .filter((item: any) => item.productId || item._id)
            .map((item: any) => ({
              productKey: item.productKey,
              qty: Math.max(1, Number(item.qty || 1)),
              variant: item.variant || "default",
            }));

          if (!cleanedCart.length) {
            alert(
              "Cart is not valid. Please refresh and add products again."
            );

            setLoading(false);
            return;
          }

          // ANgroup's order-create rejects any item priced at ₹0 (a real
          // safeguard, not a bug -- an unpriced product genuinely shouldn't
          // be orderable), but previously that only surfaced as an opaque
          // 500 + generic "Checkout failed" alert with no indication of
          // which item caused it. Checking client-side first gives the
          // customer something actionable instead of a dead end.
          const unpriced = cart.filter((item: any) => !safeNumber(item.price));
          if (unpriced.length) {
            alert(
              `${unpriced.map((i: any) => i.name).join(", ")} — this product isn't available for purchase yet. Please remove it from your cart to continue.`
            );
            setLoading(false);
            return;
          }

          // Guest checkout: no login required. ANgroup's Order model keeps a
          // `customer: {name, phone, email}` sub-object independent of any
          // userId/customerId, so an unauthenticated visitor's order still
          // carries their contact/address details straight through here.
          // createOrder() routes through the shared SDK client, which attaches
          // the businessId + bearer token (when one exists) automatically —
          // a raw fetch() here would silently drop both.
          const data: any = await createOrder({
            cart: cleanedCart,
            address: form,
            customer: {
              name: form.name,
              phone: form.phone,
              email: form.email,
            },
            coupon,
            paymentMethod: "RAZORPAY",
          });

          console.log("CREATE ORDER RESPONSE:", data);

          if (!data.success) {
            alert(data.error || data.message || "Order failed");
            setLoading(false);
            return;
          }

          setOrderSummary({
            items: data.items || [],
          });

          // ANgroup's order-create now computes the small-cart fee /
          // delivery charge itself (services/order.service.ts, mirroring
          // these same constants -- see lib/orderPricing.ts there) and
          // includes them in both `data.amount` (the actual Razorpay
          // charge) and the dedicated `data.smallCartFee`/
          // `data.deliveryCharge` fields, so the amount actually charged is
          // guaranteed to match what's shown here -- no need to
          // independently re-derive them client-side any more.
          setSummary({
            subtotal: safeNumber(data.subtotal),
            subtotalBeforeTax: safeNumber(data.taxableAmount),
            discount: safeNumber(data.discount),
            taxableAmount: safeNumber(data.taxableAmount),
            gstTotal: safeNumber(data.gstTotal),
            cgst: safeNumber(data.cgst),
            sgst: safeNumber(data.sgst),
            igst: safeNumber(data.igst),
            smallCartFee: safeNumber(data.smallCartFee),
            deliveryCharge: safeNumber(data.deliveryCharge),
            grandTotal: safeNumber(data.amount),
          });

          orderId = data.orderId;
          razorpayOrder = data.razorpayOrder;
          // From here on, a failure means "retry against this same order",
          // not "create another one".
          setPendingOrder({ orderId, razorpayOrder });
        }

        const options = {
          key:
            process.env
              .NEXT_PUBLIC_RAZORPAY_KEY_ID,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency,

          name: "AN Group",

          description:
            "Secure Checkout",

          order_id:
            razorpayOrder.id,

          prefill: {
            name: form.name,
            contact: form.phone,
            email: form.email,
          },

          notes: {
            internalOrderId:
              orderId,
          },
    
          handler: async function (
            response: any
          ) {
            console.log(
              "RAZORPAY RESPONSE:",
              response
            );
    
            try {
              const verifyPayload = {
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,

                orderId,
              };

              console.log(
                "VERIFY PAYLOAD:",
                verifyPayload
              );

              const verifyData: any = await verifyPayment(
                verifyPayload
              );

              console.log(
                "VERIFY RESPONSE:",
                verifyData
              );

              if (verifyData.success) {
                // Best-effort: only when the customer is logged in, chose to
                // save a freshly-typed address, and is actually still on
                // "new" mode (not one already picked from the saved list,
                // which needs no re-saving). Never blocks navigating to the
                // success page on failure.
                if (isLoggedIn() && saveThisAddress && addressMode === "new") {
                  addSavedAddress({
                    line1: form.address,
                    city: form.city,
                    state: form.state,
                    pincode: form.pincode,
                    phone: form.phone,
                  }).catch((err) =>
                    console.error("SAVE ADDRESS ERROR:", err)
                  );
                }

                setPendingOrder(null);
                setCart([]);

                closeCart();

                router.push(
                  `/order-success?orderId=${orderId}`
                );
              } else {
                alert(
                  verifyData.message ||
                    "Payment verification failed"
                );
    
                setLoading(false);
              }
            } catch (err) {
              console.error(
                "VERIFY ERROR:",
                err
              );
    
              alert(
                "Payment verification failed"
              );
    
              setLoading(false);
            }
          },
    
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
    
          theme: {
            color: "#111827",
          },
        };
    
        const rzp =
          new window.Razorpay(
            options
          );
    
        rzp.open();
    
      } catch (err: any) {
        console.error(
          "CHECKOUT ERROR:",
          err
        );

        alert(err?.data?.message || err?.message || "Checkout failed");

        setLoading(false);
      }
    };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="checkoutWrapper">
      <div className="bgGlow" />

      <div className="checkoutGrid">

        {/* LEFT */}
        <div className="leftBox">
          <div className="card">
            <div className="header">
              <h1>Secure Checkout</h1>
              <p>Enterprise-grade protected payment</p>
            </div>

            <div className="section">
              <h3>Customer Details</h3>

              <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" />
              {errors.name && <p className="error">{errors.name}</p>}

              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" />
              {errors.phone && <p className="error">{errors.phone}</p>}

              <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" />
            </div>

            <div className="section">
              <h3>Delivery Address</h3>

              {addressMode === "picker" && savedAddresses.length > 0 && (
                <div className="addressPicker">
                  {savedAddresses.map((addr) => (
                    <label className="addressOption" key={addr._id}>
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr._id}
                        onChange={() => applySavedAddress(addr._id)}
                      />
                      <span>
                        <strong>{addr.label || "Address"}</strong>
                        {addr.isDefault && <em className="defaultTag"> (default)</em>}
                        <br />
                        {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </label>
                  ))}

                  <button
                    type="button"
                    className="addNewAddressBtn"
                    onClick={() => {
                      setAddressMode("new");
                      setSelectedAddressId("");
                      setForm((prev) => ({
                        ...prev,
                        address: "",
                        city: "",
                        state: "",
                        pincode: "",
                      }));
                    }}
                  >
                    + Use a new address
                  </button>
                </div>
              )}

              {addressMode === "new" && (
                <>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      className="backToSavedBtn"
                      onClick={() => {
                        setAddressMode("picker");
                        if (savedAddresses[0]) applySavedAddress(savedAddresses[0]._id);
                      }}
                    >
                      ← Choose a saved address instead
                    </button>
                  )}

                  <textarea name="address" value={form.address} onChange={handleChange} placeholder="Complete Address" />

                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" />

                  <div className="doubleGrid">
                    <input name="city" value={form.city} onChange={handleChange} placeholder="City" />
                    <input name="state" value={form.state} onChange={handleChange} placeholder="State" />
                  </div>

                  {isLoggedIn() && (
                    <label className="saveAddressCheck">
                      <input
                        type="checkbox"
                        checked={saveThisAddress}
                        onChange={(e) => setSaveThisAddress(e.target.checked)}
                      />
                      Save this address for next time
                    </label>
                  )}
                </>
              )}
            </div>

            <div className="section">
              <h3>GST Details</h3>

              <input name="gstNumber" value={form.gstNumber} onChange={handleChange} onBlur={verifyGST} placeholder="GST (Optional)" />

              {gstData && (
                <div className="successBox">GST Verified</div>
              )}
            </div>

            <div className="section">
              <h3>Coupon</h3>

              <div className="couponRow">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon Code" />
                <button className="couponBtn" onClick={applyCoupon}>Apply</button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="rightBox">
          <div className="summaryCard">

            <h2>Order Summary</h2>

            <div className="items">
              {orderSummary.items.length > 0
                ? orderSummary.items.map((item: any, i: number) => (
                    <div className="item" key={i}>
                      <div>
                        <h4>{item.name}</h4>
                        <p>Qty: {item.qty}</p>
                        <p>GST: {item.gstRate}%</p>
                        <p>Taxable: ₹{safeNumber(item.taxableValue).toFixed(2)}</p>
                      </div>

                      <div className="price">
                        ₹{safeNumber(item.lineTotal).toFixed(2)}
                      </div>
                    </div>
                  ))
                : // Before the order is actually created server-side, show a
                  // local preview built straight from the cart so the
                  // customer sees a base-price/GST breakdown up front, not
                  // only after paying. item.price is GST-inclusive; back the
                  // base price out the same way displaySummary does.
                  cart.map((item: any, i: number) => {
                    const gstPercent = safeNumber(item.gstPercent);
                    const lineTotal =
                      safeNumber(item.price) * safeNumber(item.qty);
                    const lineBase = lineTotal / (1 + gstPercent / 100);
                    const lineGst = lineTotal - lineBase;

                    return (
                      <div className="item" key={item.productId || i}>
                        <div>
                          <h4>{item.name}</h4>
                          <p>Qty: {item.qty}</p>
                          <p>
                            Base: ₹{lineBase.toFixed(2)} + GST ({gstPercent}%): ₹{lineGst.toFixed(2)}
                          </p>
                        </div>

                        <div className="price">
                          ₹{lineTotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
            </div>

              <div className="summary">
              
                <div className="summaryRow">
                  <span>Subtotal (before tax)</span>
                  <span>
                    ₹{safeNumber(displaySummary.subtotalBeforeTax).toFixed(2)}
                  </span>
                </div>

                <div className="summaryRow">
                  <span>GST (tax total)</span>
                  <span>
                    ₹{displaySummary.gstTotal.toFixed(2)}
                  </span>
                </div>

                <div className="summaryRow subtotalRow">
                  <span>Subtotal (incl. tax)</span>
                  <span>
                    ₹{displaySummary.subtotal.toFixed(2)}
                  </span>
                </div>

                {displaySummary.discount > 0 && (
                  <div className="summaryRow success">
                    <span>Discount</span>
                    <span>
                      - ₹{displaySummary.discount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Small-cart fee + delivery charge -- see lib/constants.ts.
                    Both waived once the cart subtotal reaches
                    FREE_SHIPPING_THRESHOLD. */}
                {safeNumber(displaySummary.smallCartFee) > 0 && (
                  <div className="summaryRow">
                    <span>Small Cart Fee</span>
                    <span>
                      ₹{safeNumber(displaySummary.smallCartFee).toFixed(2)}
                    </span>
                  </div>
                )}

                {safeNumber(displaySummary.deliveryCharge) > 0 ? (
                  <div className="summaryRow">
                    <span>Delivery Charge</span>
                    <span>
                      ₹{safeNumber(displaySummary.deliveryCharge).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="summaryRow success">
                    <span>Delivery Charge</span>
                    <span>FREE</span>
                  </div>
                )}

                <div className="grandTotal">
                  <span>Grand Total</span>
                  <span>
                    ₹{displaySummary.grandTotal.toFixed(2)}
                  </span>
                </div>
              
              </div>

            {pendingOrder && (
              <div className="retryBanner">
                <p>
                  Order {pendingOrder.orderId} was created but payment didn&apos;t complete.
                  Retrying will resume payment on that same order.
                </p>
                <button className="retryBannerLink" onClick={() => setPendingOrder(null)}>
                  Start over with a new order instead
                </button>
              </div>
            )}

            {displaySummary.subtotal < MIN_ORDER_VALUE && (
              <p className="warn">
                Add ₹{(MIN_ORDER_VALUE - displaySummary.subtotal).toFixed(2)} more to reach the ₹{MIN_ORDER_VALUE} minimum order value
              </p>
            )}

            <button
              className="payBtn"
              onClick={handlePay}
              disabled={loading || displaySummary.subtotal < MIN_ORDER_VALUE}
            >
              {loading
                ? "Processing..."
                : pendingOrder
                ? "Retry Payment"
                : `Pay ₹${displaySummary.grandTotal.toFixed(2)}`}
            </button>

            <div className="secureNote">🔒 Protected by Razorpay Secure</div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .checkoutWrapper {
          min-height: 100vh;
          background:
            linear-gradient(
              180deg,
              #f8fafc,
              #eef2ff
            );
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .bgGlow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: rgba(99,102,241,.12);
          filter: blur(120px);
          top: -200px;
          right: -200px;
          border-radius: 50%;
        }

        .checkoutGrid {
          max-width: 1400px;
          margin: auto;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 28px;
          position: relative;
          z-index: 2;
        }

        .card,
        .summaryCard {
          background: rgba(255,255,255,.75);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 30px;
          border: 1px solid rgba(255,255,255,.7);
          box-shadow:
            0 10px 40px rgba(0,0,0,.08);
          animation:
            fadeUp .5s ease;
        }

        .header h1 {
          font-size: 34px;
          margin-bottom: 8px;
          color: #0f172a;
        }

        .header p {
          color: #64748b;
          margin-bottom: 30px;
        }

        .section {
          margin-bottom: 30px;
        }

        .section h3 {
          margin-bottom: 14px;
          color: #111827;
        }

        input,
        textarea {
          width: 100%;
          padding: 15px;
          border-radius: 16px;
          border: 1px solid #dbe2ea;
          margin-bottom: 12px;
          font-size: 15px;
          transition: all .25s ease;
          background: white;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #111827;
          transform: translateY(-1px);
          box-shadow:
            0 8px 20px rgba(0,0,0,.06);
        }

        textarea {
          min-height: 110px;
          resize: vertical;
        }

        .doubleGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .addressPicker {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px;
        }

        .addressOption {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          border: 1px solid #dbe2ea;
          border-radius: 14px;
          padding: 12px 14px;
          cursor: pointer;
          font-size: 14px;
          color: #334155;
          background: white;
        }

        .addressOption input {
          width: auto;
          margin: 3px 0 0;
        }

        .defaultTag {
          color: #16a34a;
          font-style: normal;
          font-size: 12px;
        }

        .addNewAddressBtn,
        .backToSavedBtn {
          background: none;
          border: none;
          padding: 0;
          color: #111827;
          font-size: 13px;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          text-align: left;
          margin-bottom: 12px;
        }

        .saveAddressCheck {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #475569;
          margin-top: -4px;
          margin-bottom: 12px;
        }

        .saveAddressCheck input {
          width: auto;
          margin: 0;
        }

        .couponRow {
          display: flex;
          gap: 10px;
        }

        .couponBtn,
        .payBtn {
          border: none;
          background: linear-gradient(
            135deg,
            #1f3d2b,
            #16301f
          );
          color: white;
          border-radius: 16px;
          cursor: pointer;
          font-weight: 600;
          transition: .25s ease;
        }

        .couponBtn {
          width: 120px;
        }

        .couponBtn:hover,
        .payBtn:hover {
          transform: translateY(-2px);
        }

        .payBtn {
          width: 100%;
          padding: 18px;
          font-size: 16px;
          margin-top: 24px;
        }

        .summaryCard h2 {
          margin-bottom: 24px;
        }

        .item {
          display: flex;
          justify-content: space-between;
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid #eef2f7;
        }

        .item h4 {
          margin-bottom: 6px;
        }

        .item p {
          font-size: 14px;
          color: #64748b;
        }

        .price {
          font-weight: 700;
        }

        .summary {
          margin-top: 24px;
        }

        .summaryRow,
        .grandTotal {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .grandTotal {
          border-top: 1px solid #e2e8f0;
          padding-top: 18px;
          margin-top: 18px;
          font-size: 22px;
          font-weight: 800;
        }

        .error {
          color: #dc2626;
          font-size: 13px;
          margin-top: -5px;
          margin-bottom: 12px;
        }

        .success {
          color: #16a34a;
        }

        .successBox {
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          padding: 14px;
          border-radius: 14px;
          color: #166534;
        }

        .secureNote {
          margin-top: 18px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .retryBanner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 14px;
          padding: 14px;
          margin-top: 20px;
        }

        .retryBanner p {
          color: #991b1b;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .retryBannerLink {
          background: none;
          border: none;
          padding: 0;
          color: #111827;
          font-size: 13px;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
        }

        .warn {
          color: #b45309;
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 600;
          margin-top: 20px;
          text-align: center;
        }

        .payBtn:disabled {
          opacity: .5;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}
