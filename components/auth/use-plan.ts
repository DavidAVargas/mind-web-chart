"use client";

import { useUser } from "@clerk/nextjs";

/**
 * What the signed-in account can do. Paying will set `plan: "pro"` on the
 * account; until payments exist, only admins have the full version.
 */
export function usePlan() {
  const { user } = useUser();
  const metadata = user?.publicMetadata;
  const isAdmin = metadata?.role === "admin";
  return { isAdmin, isPaid: isAdmin || metadata?.plan === "pro" };
}
