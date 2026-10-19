import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Native Shops", manifest: "/shop-manifest.json",
  appleWebApp: { capable: true, title: "Native Shops", statusBarStyle: "default" },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
