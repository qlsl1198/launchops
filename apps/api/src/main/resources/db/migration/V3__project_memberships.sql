create table project_memberships (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    user_id uuid not null references app_users(id) on delete cascade,
    role text not null default 'MEMBER',
    created_at timestamptz not null default now(),
    unique(project_id, user_id)
);

create index ix_project_memberships_user on project_memberships(user_id);
create index ix_project_memberships_project on project_memberships(project_id);

