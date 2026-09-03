"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { getStoredPincode, PINCODE_CHANGED_EVENT } from "@/lib/pincode";
import { getShops, createLiveMarketOrder, LiveMarketOrderItemInput } from "@/lib/an-sdk/liveMarket";
import { ApiError } from "@/lib/an-sdk/client";
import LiveMarketCatalogPicker from "@/components/LiveMarketCatalogPicker";

export default function LiveMarketPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [pincode, setPincode] = useState("");
  const [shops, setShops] = useState<any[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [shopsError, setShopsError] = useState("");
  const [selectedShopId, setSelectedShopId] = useState("");

  const [cartItems, setCartItems] = useState<LiveMarketOrderItemInput[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setPincode(getStoredPincode());
    const onChange = (e: any) => setPincode(e.detail || getStoredPincode());
    window.addEventListener(PINCODE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(PINCODE_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setShopsLoading(true);
    setShopsError("");
    getShops(pincode)
      .then((list) => {
        if (cancelled) return;
        setShops(list);
        setSelectedShopId((prev) => (list.some((s: any) => s._id === prev) ? prev : list[0]?._id || ""));
      })
      .catch((err) => {
        if (cancelled) return;
        setShopsError(err instanceof ApiError ? err.message : "Could not load shops");
      })
      .finally(() => {
        if (!cancelled) setShopsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pincode]);

  const handlePlaceOrder = async () => {
    setSubmitError("");

    if (!user) {
      router.push("/login?next=/live-market");
      return;
    }
    if (!pincode) {
      setSubmitError("Please set your delivery pincode first (top bar).");
      return;
    }
    if (!selectedShopId) {
      setSubmitError("Please select a shop.");
      return;
    }
    if (!cartItems.length) {
      setSubmitError("Add at least one item to your cart.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createLiveMarketOrder({
        customerId: user.id,
        pincode,
        shopId: selectedShopId,
        items: cartItems,
      });
      router.push(`/live-market/orders/${order._id}`);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  const notAvailable = !shopsLoading && !shopsError && (!pincode || !shops.length);

  return (
    <div className="container">
      <div className="headRow">
        <h1>Live Market</h1>
        <Link href="/live-market/orders" className="link">
          My Live Market Orders
        </Link>
      </div>
      <p className="sub">
        Fresh Fish, Chicken, Mutton and more — today&apos;s real price, straight to your door.
      </p>

      {notAvailable ? (
        <div className="comingSoon">
          <span className="comingSoonBadge">Coming soon to your area</span>
          <h2>How Live Market works</h2>
          <p>
            Pick items at today&apos;s real price — no waiting for a quote — pay, and we deliver fresh from a
            shop near you.
          </p>
          <p className="comingSoonNote">
            We&apos;ll be in your city soon! {pincode ? (
              <>We don&apos;t have a shop live in <strong>{pincode}</strong> just yet.</>
            ) : (
              <>Set your delivery pincode (top bar) and we&apos;ll let you know the moment Live Market is live near you.</>
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="section">
            <h2>1. Choose a shop</h2>
            {shopsLoading && <p>Loading shops…</p>}
            {shopsError && <p className="error">{shopsError}</p>}
            {!!shops.length && (
              <div className="shopGrid">
                {shops.map((shop) => (
                  <button
                    type="button"
                    key={shop._id}
                    className={`shopCard ${selectedShopId === shop._id ? "selected" : ""}`}
                    onClick={() => setSelectedShopId(shop._id)}
                  >
                    <p className="shopName">{shop.name}</p>
                    {shop.address && <p className="shopAddr">{shop.address}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedShopId && (
            <div className="section">
              <h2>2. Pick items — today&apos;s price</h2>
              <LiveMarketCatalogPicker
                key={selectedShopId}
                shopId={selectedShopId}
                onCartChange={(items, total) => {
                  setCartItems(items);
                  setCartTotal(total);
                }}
              />
            </div>
          )}

          <div className="section">
            <div className="checkoutRow">
              <div>
                <p className="totalLabel">Total</p>
                <p className="totalValue">₹{cartTotal.toFixed(2)}</p>
              </div>
              {submitError && <p className="error">{submitError}</p>}
              <button
                type="button"
                className="submitBtn"
                onClick={handlePlaceOrder}
                disabled={submitting || userLoading || !cartItems.length}
              >
                {submitting ? "Placing order…" : "Place Order"}
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .headRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .link {
          color: #c28b45;
          font-weight: 600;
          text-decoration: none;
        }
        .sub {
          color: #666;
          margin: 8px 0 24px;
        }
        .comingSoon {
          background: #fffdf8;
          border: 1px solid #f0e2c6;
          border-radius: 16px;
          padding: 36px 32px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.04);
        }
        .comingSoonBadge {
          display: inline-block;
          background: #eef6ec;
          color: #1f3d2b;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 14px;
        }
        .comingSoon h2 {
          margin: 0 0 12px;
          font-size: 20px;
          color: #1f3d2b;
        }
        .comingSoon p {
          max-width: 520px;
          margin: 0 auto 12px;
          color: #555;
          line-height: 1.6;
        }
        .comingSoonNote {
          font-weight: 600;
          color: #7c5a1e;
        }
        .section {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        h2 {
          margin: 0 0 14px;
          font-size: 16px;
        }
        .shopGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        .shopCard {
          text-align: left;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 12px 14px;
          background: #fafafa;
          cursor: pointer;
        }
        .shopCard.selected {
          border-color: #c28b45;
          background: #fff7ec;
        }
        .shopName {
          font-weight: 600;
          margin: 0 0 4px;
        }
        .shopAddr {
          margin: 0;
          font-size: 12px;
          color: #777;
        }
        .checkoutRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .totalLabel {
          margin: 0;
          font-size: 12px;
          color: #888;
        }
        .totalValue {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #1f3d2b;
        }
        .error {
          color: #e11d48;
        }
        .submitBtn {
          padding: 12px 28px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-weight: 700;
          cursor: pointer;
        }
        .submitBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
