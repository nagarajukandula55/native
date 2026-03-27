import jwt from "jsonwebtoken";

export function verifyToken(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
