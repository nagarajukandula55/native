import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { email, password } = await req.json();

  // Read from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    return new Response("Admin credentials not configured", { status: 500 });
  }

  const isValid = email === adminEmail && (await bcrypt.compare(password, adminPasswordHash));
  if (!isValid) return new Response("Invalid credentials", { status: 401 });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

  return new Response(JSON.stringify({ token }), { status: 200 });
}
