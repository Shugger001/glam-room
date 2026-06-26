-- Audit trail for profile role changes by admins.
create table if not exists public.role_audit_log (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references public.profiles (id) on delete cascade,
  actor_user_id uuid not null references public.profiles (id) on delete cascade,
  previous_role text not null check (previous_role in ('client', 'staff', 'admin')),
  next_role text not null check (next_role in ('client', 'staff', 'admin')),
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists role_audit_target_idx on public.role_audit_log (target_user_id, created_at desc);
create index if not exists role_audit_actor_idx on public.role_audit_log (actor_user_id, created_at desc);

alter table public.role_audit_log enable row level security;

drop policy if exists "Admins read role audit log" on public.role_audit_log;
create policy "Admins read role audit log" on public.role_audit_log
  for select using (public.is_admin());

drop policy if exists "Admins insert role audit log" on public.role_audit_log;
create policy "Admins insert role audit log" on public.role_audit_log
  for insert with check (public.is_admin());
