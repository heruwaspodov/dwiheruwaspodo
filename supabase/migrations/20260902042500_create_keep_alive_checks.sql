create table if not exists public.keep_alive_checks (
  id smallint primary key default 1,
  checked_at timestamptz not null default now(),
  hits bigint not null default 1,
  constraint keep_alive_checks_single_row check (id = 1)
);

alter table public.keep_alive_checks enable row level security;

drop policy if exists "keep_alive_checks_no_public_access" on public.keep_alive_checks;

create policy "keep_alive_checks_no_public_access"
  on public.keep_alive_checks
  for all
  using (false)
  with check (false);
