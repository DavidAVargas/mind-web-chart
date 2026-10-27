import {
  currentUserId,
  isUuid,
  json,
  mapColumns,
  readMap,
  sql,
  type ChartRow,
} from "@/lib/server/charts";

// Every query also matches on user_id, so nobody can reach someone else's chart.

export async function GET(_request: Request, ctx: RouteContext<"/api/charts/[id]">) {
  const userId = await currentUserId();
  if (!userId) return json(401, { error: "signed-out" });
  const { id } = await ctx.params;
  if (!isUuid(id)) return json(404, { error: "not-found" });

  const rows = (await sql`
    select map from charts where id = ${id} and user_id = ${userId}
  `) as Pick<ChartRow, "map">[];
  if (!rows[0]) return json(404, { error: "not-found" });
  return json(200, rows[0].map);
}

export async function PUT(request: Request, ctx: RouteContext<"/api/charts/[id]">) {
  const userId = await currentUserId();
  if (!userId) return json(401, { error: "signed-out" });
  const { id } = await ctx.params;
  if (!isUuid(id)) return json(404, { error: "not-found" });

  const body = await request.json().catch(() => null);
  const map = readMap(body?.map);
  if (!map) return json(400, { error: "invalid-map" });

  const columns = mapColumns(map);
  const rows = (await sql`
    update charts set
      title = ${columns.title},
      emoji = ${columns.emoji},
      map = ${columns.map},
      bubble_count = ${columns.bubbleCount},
      action_count = ${columns.actionCount},
      done_count = ${columns.doneCount},
      updated_at = now()
    where id = ${id} and user_id = ${userId}
    returning id
  `) as { id: string }[];
  if (!rows[0]) return json(404, { error: "not-found" });
  return new Response(null, { status: 204 });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/charts/[id]">) {
  const userId = await currentUserId();
  if (!userId) return json(401, { error: "signed-out" });
  const { id } = await ctx.params;
  if (!isUuid(id)) return json(404, { error: "not-found" });

  await sql`delete from charts where id = ${id} and user_id = ${userId}`;
  return new Response(null, { status: 204 });
}
