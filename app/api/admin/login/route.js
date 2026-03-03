import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { email, password } = await req.json();

  // Dummy admin credentials
  const adminEmail = process.env.admin@shopnative.in;
  const adminPasswordHash = process.env.$2a$12$48tMRVzkqKMAoiBW//3pzOKRd967FNmieY95vRZa1jIfpntvnJFSm;

  if (!adminEmail || !adminPasswordHash)
    return new Response("Admin credentials not configured", { status: 500 });

  const valid = email === adminEmail && (await bcrypt.compare(password, adminPasswordHash));
  if (!valid) return new Response("Invalid credentials", { status: 401 });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return new Response(JSON.stringify({ token }), { status: 200 });
}
