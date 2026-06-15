create table app_users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    password_hash text not null,
    role text not null default 'OWNER',
    created_at timestamptz not null default now()
);

create index ix_app_users_email on app_users(email);

