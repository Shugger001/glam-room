-- Default currency for Ghana operations (new rows only; re-run seed for services).
alter table public.services alter column currency set default 'GHS';
alter table public.orders alter column currency set default 'GHS';
