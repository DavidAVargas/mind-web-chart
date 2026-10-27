-- One row per chart. The map itself (bubbles and threads) is stored as JSON;
-- title, emoji and counts are copied out of it so the home page can list
-- charts without reading every map.
create table if not exists charts (
  id uuid primary key,
  user_id text not null,
  title text not null,
  emoji text not null,
  map jsonb not null,
  bubble_count integer not null default 0,
  action_count integer not null default 0,
  done_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists charts_user_id_updated_at
  on charts (user_id, updated_at desc);
