-- Paystack deposit references for salon bookings

alter table public.bookings
  add column if not exists paystack_reference text;

create unique index if not exists bookings_paystack_reference_key
  on public.bookings (paystack_reference)
  where paystack_reference is not null;

comment on column public.bookings.paystack_reference is
  'Paystack transaction reference when a booking deposit was initiated.';
