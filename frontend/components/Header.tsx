"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between">
        <h1 className="font-bold text-xl">NextCommerce</h1>
        <nav className="space-x-6">
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/admin/login">Admin Login</Link>
        </nav>
      </div>
    </header>
  );
}
