export const metadata = {
  title: "ShopNative",
  description: "Indian Native Products Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
