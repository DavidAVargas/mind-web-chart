import { FREE_CHART_LIMIT } from "@/lib/mind-map/chart-meta";
import {
  currentUserId,
  isPaid,
  isUuid,
  json,
  mapColumns,
  readMap,
  sql,
  toMeta,
  type ChartRow,
} from "@/lib/server/charts";

/** Every chart the signed-in user owns, with its map for the card previews. */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return json(401, { error: "signed-out" });

  const rows = (await sql`
    select * from charts where user_id = ${userId} order by updated_at desc
  `) as ChartRow[];
  return json(200, rows.map((row) => ({ ...toMeta(row), map: row.map })));
}

/**
 * Saves a new chart. The id can come from the browser, so a chart that's
 * deleted and then undone, or imported, keeps the same address.
 */
export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return json(401, { error: "signed-out" });

  const body = await request.json().catch(() => null);
  const map = readMap(body?.map);
  if (!map) return json(400, { error: "invalid-map" });
  const id = isUuid(body?.id) ? body.id : crypto.randomUUID();
  const createdAt =
    typeof body?.createdAt === "number" ? new Date(body.createdAt) : new Date();

  const [{ count }] = (await sql`
    select count(*)::int as count from charts where user_id = ${userId}
  `) as { count: number }[];
  if (count >= FREE_CHART_LIMIT && !(await isPaid(userId))) {
    return json(403, { error: "limit", limit: FREE_CHART_LIMIT });
  }

  const columns = mapColumns(map);
  const rows = (await sql`
    insert into charts (id, user_id, title, emoji, map, bubble_count, action_count, done_count, created_at)
    values (${id}, ${userId}, ${columns.title}, ${columns.emoji}, ${columns.map},
      ${columns.bubbleCount}, ${columns.actionCount}, ${columns.doneCount}, ${createdAt})
    on conflict (id) do nothing
    returning *
  `) as ChartRow[];
  if (!rows[0]) return json(409, { error: "exists" });
  return json(201, toMeta(rows[0]));
}
