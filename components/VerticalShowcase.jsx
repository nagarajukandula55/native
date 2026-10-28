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
        // Preview the catalogue before pincode entry; the vertical page
        // performs the authoritative service-area check at order time.
        const shops = await getShops();
        const shopIds = (shops || []).map((shop) => shop._id).filter(Boolean);
        const catalogueForShops = (loader) => Promise.all(shopIds.map((shopId) => loader(shopId).catch(() => []))).then((lists) => {
          const seen = new Set();
          return lists.flat().filter((item) => item?._id && !seen.has(String(item._id)) && (seen.add(String(item._id)), true));
        });
        const [fresh, live, grocery, santha] = await Promise.all([
          catalogueForShops((shopId) => getFreshItems(shopId).then((r) => r.items)),
          catalogueForShops((shopId) => getLiveMarketItems(shopId).then((r) => r.items)),
          catalogueForShops((shopId) => getGroceryItems("GROCERY", undefined, shopId)),
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
        <p>Browse the catalogue now. We’ll confirm delivery availability when you start ordering.</p>
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
                <small className="verticalItemPrice" style={{ display: "block", marginTop: 7, padding: "4px 6px", borderRadius: 6, background: "#eef7e9", color: "#236b42", fontWeight: 800, width: "max-content", maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.displayRatePerUnit ? `₹${item.displayRatePerUnit}/${item.unit || "unit"}` : "Price after selection"}</small>
                <b>Start ordering</b>
              </Link>)}
              <Link href={vertical.href} className="verticalViewMoreTile" style={{ display: "flex", minHeight: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center" }}><span>＋</span><b>Start ordering</b><small>{vertical.label}</small></Link>
            </div> : <p className="verticalShowcaseMessage">Browse the catalogue and start ordering.</p>}
          </article>;
        })}
      </div>
      <style jsx>{`
        .verticalShowcase{max-width:1200px;margin:0 auto;padding:34px 20px 10px}.verticalShowcaseHeading{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:18px}.eyebrow{margin:0 0 4px;color:#2f8f5b;font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.verticalShowcaseHeading h2{margin:0;color:#234a34;font-size:1.65rem}.verticalShowcaseHeading>p{max-width:330px;margin:0;color:#68756c;font-size:.9rem}.verticalShowcaseGrid{display:grid;grid-template-columns:1fr;gap:18px}.verticalShowcaseCard{padding:22px;border:1px solid #e4eadf;border-radius:20px;background:#fff;box-shadow:0 8px 22px #234a340b}.verticalShowcaseCardHead{display:flex;gap:12px;align-items:center;margin-bottom:16px}.verticalShowcaseIcon{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:#edf6e9;font-size:24px}.verticalShowcaseCard h3{margin:0;color:#234a34;font-size:1.25rem}.verticalShowcaseCardHead p{margin:4px 0 0;color:#718078;font-size:.85rem}.verticalItems{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}.verticalItem{min-width:0;padding:10px;border:1px solid #edf0ea;border-radius:14px;color:#304239;text-decoration:none;font-size:.85rem;font-weight:650;background:#fff;transition:transform .16s ease,box-shadow .16s ease}.verticalItem:hover{transform:translateY(-2px);box-shadow:0 6px 16px #234a3414}.verticalItemImage{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#f2f5ef;margin-bottom:9px}.verticalItemImage :global(img){object-fit:cover}.verticalItem span{display:block;min-height:2.5em;line-height:1.25;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.verticalItem small{display:block;margin-top:7px;min-height:1.2em;color:#6b806f;font-size:.75rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.verticalItem b{display:block;margin-top:9px;color:#237245;font-size:.75rem}.verticalViewMoreTile{display:flex;min-height:100%;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:1px dashed #b9d2bc;border-radius:14px;color:#237245;text-decoration:none;text-align:center;background:#fbfef9}.verticalViewMoreTile span{font-size:30px;line-height:1}.verticalViewMoreTile b{font-size:.82rem}.verticalViewMoreTile small{font-size:.72rem;color:#718078}.verticalShowcaseMessage{min-height:90px;display:grid;place-items:center;color:#78857b;font-size:.85rem}@media(max-width:700px){.verticalShowcase{padding-left:14px;padding-right:14px}.verticalShowcaseHeading{display:block}.verticalShowcaseHeading>p{margin-top:7px}.verticalShowcaseCard{padding:16px}.verticalItems{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.verticalViewMoreTile{min-height:160px}}
      `}</style>
    </section>
  );
}
