-- NNG Store keeps one table. The catalog lives in the repo as JSON and is
-- served as static pages, so the database only sees purchases.
-- Each row is about 300 bytes; 100,000 orders fit in roughly 30 MB.

create table if not exists orders (
  id           text primary key,
  email        text        not null,
  name         text        not null,
  slugs        text[]      not null,
  total        integer     not null check (total >= 0),
  mode         text        not null check (mode in ('demo', 'midtrans')),
  status       text        not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  payment_type text,
  created_at   timestamptz not null default now(),
  paid_at      timestamptz,
  updated_at   timestamptz not null default now()
);

-- Library restore looks orders up by email; only paid rows matter there.
create index if not exists orders_email_paid on orders (email) where status = 'paid';
