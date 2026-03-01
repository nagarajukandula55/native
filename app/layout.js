import "./globals.css";

export const metadata = {
  title: "Native | Authentic Indian Products",
  description: "Premium Indian traditional products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
