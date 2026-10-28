"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStoredPincode, PINCODE_CHANGED_EVENT } from "@/lib/pincode";
import { getShops, getFreshItems } from "@/lib/an-sdk/fresh";
import { getLiveMarketItems } from "@/lib/an-sdk/liveMarket";
import { getGroceryItems } from "@/lib/an-sdk/groceries";
import { getSanthaItems } from "@/lib/an-sdk/santha";

const VERTICALS = [
  { key: "fresh", label: "Fresh", href: "/fresh", icon: "🍎", text: "Fresh fruits, vegetables and everyday produce." },
  { key: "live", label: "Live Market", href: "/live-market", icon: "🐟", text: "Fish, meat and eggs sourced for your order." },
  { key: "grocery", label: "Groceries", href: "/groceries", icon: "🛒", text: "Monthly grocery essentials picked for your home." },
  { key: "santha", label: "Santha", href: "/santha", icon: "🧺", text: "Weekly market finds bought fresh for you." },
];

export default function VerticalShowcase() {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const pincode = getStoredPincode();
      setLoading(true);
      try {
        const shops = await getShops(pincode);
        const shop = shops?.[0];
        const [fresh, live, grocery, santha] = await Promise.all([
          shop ? getFreshItems(shop._id).then((r) => r.items) : [],
          shop ? getLiveMarketItems(shop._id).then((r) => r.items) : [],
          shop ? getGroceryItems("GROCERY", undefined, shop._id) : [],
          getSanthaItems(),
        ]);
        if (active) setItems({ fresh, live, grocery, santha });
      } catch {
        if (active) setItems({});
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    const refresh = () => load();
    window.addEventListener(PINCODE_CHANGED_EVENT, refresh);
    return () => { active = false; window.removeEventListener(PINCODE_CHANGED_EVENT, refresh); };
  }, []);

  return (
    <section className="verticalShowcase" aria-labelledby="vertical-showcase-title">
      <div className="verticalShowcaseHeading">
        <div><p className="eyebrow">More from Native</p><h2 id="vertical-showcase-title">Shop fresh, local and everyday essentials</h2></div>
        <p>Choose a service below to see what is available in your area.</p>
      </div>
      <div className="verticalShowcaseGrid">
        {VERTICALS.map((vertical) => {
          const list = (items[vertical.key] || []).slice(0, 4);
          return <article className="verticalShowcaseCard" key={vertical.key}>
            <div className="verticalShowcaseCardHead"><span className="verticalShowcaseIcon">{vertical.icon}</span><div><h3>{vertical.label}</h3><p>{vertical.text}</p></div></div>
            {loading ? <p className="verticalShowcaseMessage">Loading items...</p> : list.length ? <div className="verticalItems">
              {list.map((item) => <Link href={vertical.href} className="verticalItem" key={item._id}>
                <div className="verticalItemImage"><Image src={item.imageUrl || "/placeholder.png"} alt="" fill sizes="90px" /></div>
                <span>{item.name}</span>
                {item.displayRatePerUnit ? <small>₹{item.displayRatePerUnit}/{item.unit || "unit"}</small> : <small>{item.unit || "View availability"}</small>}
              </Link>)}
            </div> : <p className="verticalShowcaseMessage">Set your pincode to see available items.</p>}
            <Link href={vertical.href} className="verticalViewMore">View more {vertical.label} →</Link>
          </article>;
        })}
      </div>
      <style jsx>{`
        .verticalShowcase{max-width:1200px;margin:0 auto;padding:34px 20px 10px}.verticalShowcaseHeading{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:18px}.eyebrow{margin:0 0 4px;color:#2f8f5b;font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.verticalShowcaseHeading h2{margin:0;color:#234a34;font-size:1.65rem}.verticalShowcaseHeading>p{max-width:330px;margin:0;color:#68756c;font-size:.9rem}.verticalShowcaseGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.verticalShowcaseCard{padding:18px;border:1px solid #e4eadf;border-radius:20px;background:#fff;box-shadow:0 8px 22px #234a340b}.verticalShowcaseCardHead{display:flex;gap:12px;align-items:center;margin-bottom:15px}.verticalShowcaseIcon{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:#edf6e9;font-size:24px}.verticalShowcaseCard h3{margin:0;color:#234a34;font-size:1.1rem}.verticalShowcaseCardHead p{margin:3px 0 0;color:#718078;font-size:.8rem}.verticalItems{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.verticalItem{min-width:0;color:#304239;text-decoration:none;font-size:.8rem;font-weight:650}.verticalItemImage{position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;background:#f2f5ef;margin-bottom:7px}.verticalItemImage :global(img){object-fit:cover}.verticalItem span,.verticalItem small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.verticalItem small{margin-top:3px;color:#6b806f;font-size:.72rem;font-weight:500}.verticalShowcaseMessage{min-height:90px;display:grid;place-items:center;color:#78857b;font-size:.85rem}.verticalViewMore{display:inline-block;margin-top:15px;color:#237245;font-size:.85rem;font-weight:750;text-decoration:none}@media(max-width:700px){.verticalShowcaseHeading{display:block}.verticalShowcaseHeading>p{margin-top:7px}.verticalShowcaseGrid{grid-template-columns:1fr}.verticalItems{grid-template-columns:repeat(4,minmax(0,1fr))}}
      `}</style>
    </section>
  );
}
