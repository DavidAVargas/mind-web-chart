import { syncPlan } from "@/lib/server/billing";
import { currentUserId, json } from "@/lib/server/charts";

/**
 * Called right after a purchase or restore, so Pro switches on straight away
 * instead of waiting for RevenueCat's webhook.
 */
export async function POST() {
  const userId = await currentUserId();
  if (!userId) return json(401, { error: "signed-out" });

  try {
    return json(200, { pro: await syncPlan(userId) });
  } catch (error) {
    console.error("Plan sync failed", error);
    return json(503, { error: "billing-unavailable" });
  }
}
