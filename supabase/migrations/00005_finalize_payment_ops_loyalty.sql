-- Operational dead-letter log (server/service-role only; no user_id required)
create table if not exists public.ops_dead_letter_log (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  message text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ops_dead_letter_created_idx on public.ops_dead_letter_log (created_at desc);

alter table public.ops_dead_letter_log enable row level security;

-- Booking reminder + follow-up flags (cron jobs)
alter table public.bookings
  add column if not exists reminder_state jsonb not null default '{}'::jsonb;

alter table public.bookings
  add column if not exists follow_up_sent_at timestamptz;

-- Loyalty + referrals (profiles)
alter table public.profiles
  add column if not exists glow_points int not null default 0;

alter table public.profiles
  add column if not exists referral_code text;

create unique index if not exists profiles_referral_code_key
  on public.profiles (referral_code)
  where referral_code is not null;

create table if not exists public.referral_redemptions (
  id uuid primary key default gen_random_uuid(),
  referee_user_id uuid not null references public.profiles (id) on delete cascade,
  referrer_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (referee_user_id)
);

alter table public.referral_redemptions enable row level security;

drop policy if exists "Admins read referral redemptions" on public.referral_redemptions;
create policy "Admins read referral redemptions" on public.referral_redemptions
  for select using (public.is_admin());

-- Atomic payment finalization + inventory (service_role only)
create or replace function public.finalize_order_payment(
  p_reference text,
  p_paid boolean,
  p_amount_minor int,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
  v_inv int;
  v_total_minor int;
  v_cur text;
begin
  select * into v_order from public.orders where paystack_reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  if v_order.status in ('paid', 'failed', 'cancelled') then
    return jsonb_build_object('ok', v_order.status = 'paid', 'reason', 'already_terminal', 'status', v_order.status);
  end if;

  v_total_minor := round(v_order.total::numeric * 100)::int;
  v_cur := upper(trim(coalesce(v_order.currency::text, '')));

  if p_amount_minor is not null and p_amount_minor <> v_total_minor then
    update public.orders set status = 'failed', updated_at = now() where id = v_order.id;
    return jsonb_build_object('ok', false, 'reason', 'amount_mismatch');
  end if;

  if p_currency is not null and length(trim(p_currency)) > 0 and upper(trim(p_currency)) <> v_cur then
    update public.orders set status = 'failed', updated_at = now() where id = v_order.id;
    return jsonb_build_object('ok', false, 'reason', 'currency_mismatch');
  end if;

  if not p_paid then
    update public.orders set status = 'failed', updated_at = now() where id = v_order.id;
    return jsonb_build_object('ok', false, 'reason', 'not_paid');
  end if;

  for v_item in
    select * from public.order_items where order_id = v_order.id order by product_id
  loop
    select inventory into v_inv from public.products where id = v_item.product_id for update;
    if v_inv is null or v_inv < v_item.quantity then
      update public.orders set status = 'failed', updated_at = now() where id = v_order.id;
      return jsonb_build_object('ok', false, 'reason', 'insufficient_inventory', 'product_id', v_item.product_id);
    end if;
  end loop;

  for v_item in
    select * from public.order_items where order_id = v_order.id order by product_id
  loop
    update public.products
    set inventory = inventory - v_item.quantity, updated_at = now()
    where id = v_item.product_id;
  end loop;

  update public.orders set status = 'paid', updated_at = now() where id = v_order.id;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.finalize_order_payment(text, boolean, int, text) from public;
grant execute on function public.finalize_order_payment(text, boolean, int, text) to service_role;
