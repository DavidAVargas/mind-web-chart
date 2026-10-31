import { clerkClient } from "@clerk/nextjs/server";
import { PRO_ENTITLEMENT } from "@/lib/billing/plans";

const REVENUECAT_API = "https://api.revenuecat.com/v1";

type Entitlement = {
  expires_date: string | null;
  grace_period_expires_date?: string | null;
};

const stillValid = (date: string | null | undefined) =>
  date === null || (date !== undefined && Date.parse(date) > Date.now());

/** Whether RevenueCat says this account has Pro right now. */
async function hasPro(userId: string) {
  const key = process.env.REVENUECAT_SECRET_KEY;
  if (!key) throw new Error("REVENUECAT_SECRET_KEY is not set");

  const response = await fetch(
    `${REVENUECAT_API}/subscribers/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" },
  );
  if (!response.ok) throw new Error(`RevenueCat returned ${response.status}`);

  const { subscriber } = await response.json();
  const entitlement: Entitlement | undefined =
    subscriber?.entitlements?.[PRO_ENTITLEMENT];
  if (!entitlement) return false;
  // A lifetime purchase never expires; a failed renewal keeps Pro through its grace period.
  return (
    stillValid(entitlement.expires_date) ||
    stillValid(entitlement.grace_period_expires_date)
  );
}

/**
 * Copies the account's Pro status from RevenueCat onto the Clerk account,
 * where every check in the app reads it. Admins keep their role either way.
 */
export async function syncPlan(userId: string) {
  const pro = await hasPro(userId);
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { plan: pro ? "pro" : null },
  });
  return pro;
}

/** RevenueCat ids for signed-in people are their Clerk ids; anything else is skipped. */
export const isClerkUserId = (value: unknown): value is string =>
  typeof value === "string" && /^user_[A-Za-z0-9]+$/.test(value);
