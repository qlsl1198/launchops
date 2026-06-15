create extension if not exists pgcrypto;

create table if not exists projects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    project_key text not null unique,
    environment text not null default 'production',
    created_at timestamptz not null default now()
);

create table if not exists app_users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    password_hash text not null,
    role text not null default 'OWNER',
    created_at timestamptz not null default now()
);

create index if not exists ix_app_users_email on app_users(email);

create table if not exists product_events (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    account_id text not null,
    user_id text,
    name text not null,
    source text not null default 'api',
    severity text not null check (severity in ('info', 'warning', 'error', 'critical')),
    duration_ms integer,
    properties jsonb not null default '{}',
    occurred_at timestamptz not null,
    received_at timestamptz not null default now()
);

create index if not exists ix_product_events_project_name_created on product_events(project_id, name, occurred_at desc);
create index if not exists ix_product_events_account_created on product_events(account_id, occurred_at desc);

create table if not exists incidents (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    title text not null,
    status text not null default 'open',
    severity text not null default 'sev3',
    owner text,
    impact text not null default '',
    ai_summary text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists ops_tasks (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    incident_id uuid references incidents(id) on delete set null,
    title text not null,
    status text not null default 'todo',
    priority text not null default 'medium',
    assignee text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists account_health (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    account_id text not null,
    event_count_24h integer not null default 0,
    error_count_24h integer not null default 0,
    p95_duration_ms integer,
    risk_score numeric(5, 2) not null default 0,
    summary text not null default '',
    updated_at timestamptz not null default now(),
    unique(project_id, account_id)
);

alter table projects enable row level security;
alter table app_users enable row level security;
alter table product_events enable row level security;
alter table incidents enable row level security;
alter table ops_tasks enable row level security;
alter table account_health enable row level security;

insert into projects (name, project_key, environment)
values ('LaunchOps Demo', 'demo', 'production')
on conflict (project_key) do nothing;
