create extension if not exists "uuid-ossp";

create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  name text not null,
  website_url text not null,
  tagline text,
  target_audience text,
  brand_dna jsonb,
  created_at timestamptz not null default now()
);

create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  ideas jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  campaign_id text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
