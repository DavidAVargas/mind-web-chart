"use client";

import { useUser } from "@clerk/nextjs";

/**
 * What the signed-in account can do. Buying Pro sets `plan: "pro"` on the
 * account (see lib/server/billing.ts); admins get everything without paying.
 */
export function usePlan() {
  const { user } = useUser();
  const metadata = user?.publicMetadata;
  const isAdmin = metadata?.role === "admin";
  const isPro = metadata?.plan === "pro";
  return { isAdmin, isPro, isPaid: isAdmin || isPro };
}
