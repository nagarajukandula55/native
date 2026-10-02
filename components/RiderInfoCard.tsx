"use client";

/**
 * Shown on every order-detail page (Fresh/Live Market/Groceries/Santha)
 * once a rider is assigned -- name + a tap-to-call link, plus a plain-
 * English status line ("picked up and on the way") so the customer
 * doesn't have to interpret a raw status enum. executiveId is populated
 * server-side (angroup's GET /api/*-orders/:id routes already
 * .populate("executiveId", "name email phone")) -- previously always
 * empty because the phone was never threaded from native-admin's
 * executive identity through to angroup's User record (see
 * native-admin's lib/angroupExecutiveProxy.ts / angroup's
 * lib/executiveServiceAuth.ts).
 */

const ON_THE_WAY_STATUSES = new Set(["OUT_FOR_DELIVERY", "PICKED_UP"]);
const ASSIGNED_STATUSES = new Set(["CONFIRMED", "CONFIRMED_TO_SHOP", "OUT_FOR_DELIVERY", "PICKED_UP", "DELIVERED"]);

export default function RiderInfoCard({ order }: { order: any }) {
  const executive = order.executiveId;
  if (!executive || typeof executive !== "object") return null;
  if (!ASSIGNED_STATUSES.has(order.status)) return null;

  const onTheWay = ON_THE_WAY_STATUSES.has(order.status);
  const delivered = order.status === "DELIVERED";

  return (
    <div className="section rider">
      <h2>Delivery</h2>
      <p className="statusLine">
        {delivered ? "✅ Delivered" : onTheWay ? "🛵 Your rider has picked up your order and is on the way" : "👤 A rider has been assigned to your order"}
      </p>
      {!delivered && (
        <div className="riderRow">
          <div>
            <p className="riderName">{executive.name || "Rider"}</p>
            {executive.phone && <p className="riderPhone">{executive.phone}</p>}
          </div>
          {executive.phone && (
            <a href={`tel:${executive.phone}`} className="callBtn">
              📞 Call Rider
            </a>
          )}
        </div>
      )}
      <style jsx>{`
        .section {
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 16px;
        }
        h2 {
          margin: 0 0 10px;
          font-size: 15px;
        }
        .statusLine {
          margin: 0 0 10px;
          font-weight: 600;
          color: #1f3d2b;
        }
        .riderRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .riderName {
          margin: 0;
          font-weight: 600;
        }
        .riderPhone {
          margin: 2px 0 0;
          font-size: 13px;
          color: #666;
        }
        .callBtn {
          background: #16a34a;
          color: #fff;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
