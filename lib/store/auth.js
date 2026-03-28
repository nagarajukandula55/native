// lib/store/auth.js
import jwt from "jsonwebtoken";

export const verifyStore = (token) => {
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, process.env.JWT_SECRET);
};
