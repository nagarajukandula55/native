import { NextResponse } from "next/server";
import { resolveStateForPincode } from "@/lib/pincodeState";
import { languageForState } from "@/lib/language";

/**
 * GET /api/pincode-state/500081 -> { state, language }. Used to pick the
 * customer's display language (PincodeBar / lib/language.ts) without
 * shipping the 2.3MB pincodes.csv to the browser.
 */
export async function GET(_req: Request, context: { params: Promise<{ pincode: string }> }) {
  const { pincode } = await context.params;
  const state = resolveStateForPincode(pincode);
  return NextResponse.json({ success: true, state, language: languageForState(state) });
}
