/**
 * Vendor/shop ANy Pay wallet — read balance/statement, request a
 * withdrawal. Backed by ANgroup's /api/vendor/wallet route, which
 * proxies to AN-Accounting's wallet ledger server-side (this frontend
 * never talks to accounting directly, same as every other SDK module).
 */

import { anGet, anPost } from "./client";

export type WalletBalance = {
  available: string;
  pending: string;
  held: string;
  total: string;
};

export type WalletTransaction = {
  id: string;
  type: string;
  direction: "CREDIT" | "DEBIT";
  amount: string;
  status: "PENDING" | "AVAILABLE" | "REVERSED";
  availableAt: string;
  reason: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
};

export type WalletStatement = {
  success: boolean;
  wallet: { id: string; status: "ACTIVE" | "FROZEN" | "CLOSED"; withdrawable: boolean; frozenReason: string | null } | null;
  balance: WalletBalance;
  transactions: WalletTransaction[];
  /** FEATURE_WALLET_WITHDRAWAL phase toggle (angroup) — false hides the withdraw form even on a withdrawable wallet. */
  withdrawalsEnabled?: boolean;
  error?: string;
};

export async function getMyWallet(): Promise<WalletStatement> {
  return anGet("/api/vendor/wallet");
}

export async function requestWalletWithdrawal(amount: number): Promise<{ success: boolean; withdrawalId?: string; status?: string; error?: string }> {
  return anPost("/api/vendor/wallet", { amount });
}
