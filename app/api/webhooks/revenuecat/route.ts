import { timingSafeEqual } from "node:crypto";
import { isClerkUserId, syncPlan } from "@/lib/server/billing";

/** Constant-time compare, so the secret can't be guessed a character at a time. */
function matches(value: string, secret: string) {
  const a = Buffer.from(value);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * RevenueCat calls this whenever a subscription changes: bought, renewed,
 * cancelled, expired, refunded or moved to another account. Rather than trust
 * the event's details, it re-checks each account involved with RevenueCat and
 * updates its plan. The Authorization header carries REVENUECAT_WEBHOOK_SECRET,
 * set in RevenueCat's webhook settings.
 */
export async function POST(request: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  const header = (request.headers.get("authorization") ?? "").replace(
    /^Bearer /,
    "",
  );
  if (!secret || !matches(header, secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const event = body?.event ?? {};
  const ids = new Set(
    [
      event.app_user_id,
      event.original_app_user_id,
      ...(event.aliases ?? []),
      ...(event.transferred_from ?? []),
      ...(event.transferred_to ?? []),
    ].filter(isClerkUserId),
  );

  try {
    await Promise.all([...ids].map(syncPlan));
  } catch (error) {
    // A failure answers 500, so RevenueCat tries again later.
    console.error("RevenueCat webhook failed", error);
    return new Response("Sync failed", { status: 500 });
  }
  return new Response(null, { status: 204 });
}
