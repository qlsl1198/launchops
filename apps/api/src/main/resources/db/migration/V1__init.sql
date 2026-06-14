create extension if not exists pgcrypto;

create table projects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    project_key text not null unique,
    environment text not null default 'production',
    created_at timestamptz not null default now()
);

create table product_events (
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

create index ix_product_events_project_name_created on product_events(project_id, name, occurred_at desc);
create index ix_product_events_account_created on product_events(account_id, occurred_at desc);

create table incidents (
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

create table ops_tasks (
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

create table account_health (
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

insert into projects (name, project_key, environment)
values ('LaunchOps Demo', 'demo', 'production')
on conflict (project_key) do nothing;

insert into incidents (project_id, title, status, severity, owner, impact)
select id, 'Billing webhooks retry storm', 'investigating', 'sev2', 'backend', 'Invoices may be delayed for high-volume customers.'
from projects where project_key = 'demo'
on conflict do nothing;

insert into incidents (project_id, title, status, severity, owner, impact)
select id, 'Search p95 latency elevated', 'monitoring', 'sev3', 'platform', 'Search remains available but slower for large accounts.'
from projects where project_key = 'demo'
on conflict do nothing;

insert into product_events (project_id, account_id, user_id, name, source, severity, duration_ms, properties, occurred_at)
select id, 'acme', 'u_101', 'checkout.completed', 'server', 'info', 188, '{"plan":"pro"}', now() - interval '9 minutes'
from projects where project_key = 'demo';

insert into product_events (project_id, account_id, user_id, name, source, severity, duration_ms, properties, occurred_at)
select id, 'orbit', 'u_202', 'billing.webhook_failed', 'stripe', 'error', 1330, '{"provider":"stripe"}', now() - interval '14 minutes'
from projects where project_key = 'demo';

insert into product_events (project_id, account_id, user_id, name, source, severity, duration_ms, properties, occurred_at)
select id, 'northstar', 'u_303', 'search.timeout', 'api', 'warning', 920, '{"index":"docs"}', now() - interval '31 minutes'
from projects where project_key = 'demo';

insert into account_health (project_id, account_id, event_count_24h, error_count_24h, p95_duration_ms, risk_score, summary)
select id, 'orbit', 82, 14, 1330, 78.0, 'Webhook failures are affecting invoice delivery.'
from projects where project_key = 'demo'
on conflict (project_id, account_id) do nothing;

insert into account_health (project_id, account_id, event_count_24h, error_count_24h, p95_duration_ms, risk_score, summary)
select id, 'northstar', 61, 6, 920, 61.0, 'Search latency increased after the latest deploy.'
from projects where project_key = 'demo'
on conflict (project_id, account_id) do nothing;

insert into account_health (project_id, account_id, event_count_24h, error_count_24h, p95_duration_ms, risk_score, summary)
select id, 'acme', 124, 1, 240, 22.0, 'Healthy usage with minor warnings.'
from projects where project_key = 'demo'
on conflict (project_id, account_id) do nothing;

insert into ops_tasks (project_id, title, status, priority, assignee)
select id, 'Add idempotency key to billing worker', 'todo', 'high', 'you'
from projects where project_key = 'demo';

insert into ops_tasks (project_id, title, status, priority, assignee)
select id, 'Publish customer-facing status update', 'doing', 'medium', 'ops'
from projects where project_key = 'demo';

insert into ops_tasks (project_id, title, status, priority, assignee)
select id, 'Backfill account health rollups', 'done', 'low', 'worker'
from projects where project_key = 'demo';
