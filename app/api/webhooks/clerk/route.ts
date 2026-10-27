import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { sql } from "@/lib/server/db";

/**
 * Clerk calls this when something happens to an account. When someone deletes
 * their account, their charts are deleted with it, as the privacy policy promises.
 * The signature check (CLERK_WEBHOOK_SIGNING_SECRET) proves the call came from Clerk.
 */
export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.deleted" && event.data.id) {
    await sql`delete from charts where user_id = ${event.data.id}`;
  }

  return new Response(null, { status: 204 });
}
