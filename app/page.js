import HomeClient from "./HomeClient";

export const metadata = {
  title: "Native | Eat Healthy Stay Healthy",
  description:
    "Shop authentic, natural food products sourced directly from farmers across India — cold-pressed oils, millets, spices, snacks and more. FSSAI certified, no preservatives.",
  openGraph: {
    title: "Native | Eat Healthy Stay Healthy",
    description:
      "Authentic natural food products refined directly from the source. FSSAI certified, sourced directly from Indian farmers.",
    url: "https://shopnative.in",
    siteName: "Native",
    images: ["https://shopnative.in/hero.png"],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Native | Eat Healthy Stay Healthy",
    description:
      "Authentic natural food products refined directly from the source.",
    images: ["https://shopnative.in/hero.png"],
  },
  alternates: {
    canonical: "https://shopnative.in",
  },
};

export default function Home() {
  return <HomeClient />;
}
