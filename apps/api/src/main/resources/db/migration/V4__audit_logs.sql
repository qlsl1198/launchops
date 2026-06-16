create table audit_logs (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    actor_email text not null,
    action text not null,
    target_type text not null,
    target_id text,
    message text not null,
    details jsonb not null default '{}',
    created_at timestamptz not null default now()
);

create index ix_audit_logs_project_created on audit_logs(project_id, created_at desc);
create index ix_audit_logs_actor_created on audit_logs(actor_email, created_at desc);
