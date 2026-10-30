import { auth, clerkClient } from "@clerk/nextjs/server";
import { describe, type ChartMeta } from "@/lib/mind-map/chart-meta";
import {
  BLANK_KEY,
  LIFE_KEY,
  PROBLEM_KEY,
  parseKey,
  type ChartKey,
} from "@/lib/mind-map/chart-key";
import { parseSavedMap, type SavedMap } from "@/lib/mind-map/storage";
import { sql } from "./db";

/** Big enough for any real chart; stops someone filling the database. */
const MAX_MAP_BYTES = 1_000_000;

export type ChartRow = {
  id: string;
  title: string;
  emoji: string;
  map: SavedMap;
  bubble_count: number;
  action_count: number;
  done_count: number;
  created_at: string;
  updated_at: string;
};

export function toMeta(row: ChartRow): ChartMeta {
  return {
    id: row.id,
    title: row.title,
    emoji: row.emoji,
    bubbleCount: row.bubble_count,
    actionCount: row.action_count,
    doneCount: row.done_count,
    createdAt: Date.parse(row.created_at),
    updatedAt: Date.parse(row.updated_at),
  };
}

export const json = (status: number, body: unknown) =>
  Response.json(body, { status });

/** The signed-in user's id, or null when nobody is signed in. */
export async function currentUserId() {
  const { userId } = await auth();
  return userId;
}

/** Paid accounts and admins skip the free plan's limits. */
export async function isPaid(userId: string) {
  const client = await clerkClient();
  const { publicMetadata } = await client.users.getUser(userId);
  return publicMetadata.role === "admin" || publicMetadata.plan === "pro";
}

/** The keys charts start with. The free plan can use these, but not change them. */
const STARTER_KEYS = new Set(
  [LIFE_KEY, PROBLEM_KEY, BLANK_KEY].map((key) =>
    JSON.stringify(parseKey(key)),
  ),
);

/**
 * Whether this user may save a chart with this key. Editing a key is for paid
 * accounts, so the free plan can only save a starter key, or the key the chart
 * already had (so a chart keeps working after a plan ends). Checks the key
 * first, so most saves never need to look up the account.
 */
export async function canUseKey(
  userId: string,
  key: ChartKey | undefined,
  loadSavedKey?: () => Promise<unknown>,
) {
  const value = JSON.stringify(key ?? null);
  if (key === undefined || STARTER_KEYS.has(value)) return true;
  if (loadSavedKey && JSON.stringify(parseKey(await loadSavedKey())) === value)
    return true;
  return isPaid(userId);
}

/** Reads a map from a request body, or null if it's missing, broken or too big. */
export function readMap(value: unknown): SavedMap | null {
  if (JSON.stringify(value ?? null).length > MAX_MAP_BYTES) return null;
  return parseSavedMap(value);
}

/** The columns copied out of the map, ready to store. */
export function mapColumns(map: SavedMap) {
  const { title, emoji, bubbleCount, actionCount, doneCount } = describe(map);
  return {
    title,
    emoji,
    map: JSON.stringify(map),
    bubbleCount,
    actionCount,
    doneCount,
  };
}

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export { sql };
