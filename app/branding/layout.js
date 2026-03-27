"use client";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import BrandingSidebar from "./BrandingSidebar";

export default function BrandingLayout({ children }) {
  const token = cookies().get("token")?.value;

  if (!token) redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "branding") redirect("/login");
  } catch (err) {
    redirect("/login");
  }

  return <BrandingSidebar>{children}</BrandingSidebar>;
}
