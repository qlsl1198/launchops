# LaunchOps

LaunchOps is a portfolio-grade SaaS operations platform for solo builders and small product teams.
It combines event ingestion, product analytics, incident triage, workflow automation, and optional AI summaries in a separated frontend/backend architecture.

## Why this project exists

Hiring teams rarely need another CRUD clone. This project is designed to show practical skills that map to modern product engineering roles:

- React + TypeScript frontend with Vite
- Java 21 backend with Spring Boot, Spring Web, Spring Data JPA, Flyway, and Actuator
- PostgreSQL-first data modeling with Supabase-compatible migrations
- Redis-backed background jobs for analytics rollups and incident detection
- Realtime-ready architecture via Server-Sent Events
- Cloud-native deployment using Vercel for frontend and Render/Fly-style containers for backend
- Observability, health checks, structured settings, CI, Docker, and seed scripts
- Optional AI layer for incident summaries and customer-support insights without making AI the whole product

## Product concept

LaunchOps helps teams answer:

- Are users adopting the features we shipped?
- Which accounts are at risk because of errors, latency, or support friction?
- What happened during an incident, and what should we do next?
- Which operational tasks are blocked, stale, or high priority?

## Monorepo layout

```txt
apps/
  api/      Spring Boot service, DB models, analytics APIs
  web/      React/Vite dashboard
  ios/      SwiftUI iOS client
packages/
  contracts Shared API/event contracts
supabase/
  migrations PostgreSQL schema, pgvector-ready extension hooks, RLS notes
infra/
  docker    Local compose stack
  github    CI workflow template
docs/
  planning, architecture, deployment, interview notes
scripts/
  helper scripts for local development
```

## Local quick start

```bash
cp .env.example .env
docker compose -f infra/docker/docker-compose.yml up -d

cd apps/api
mvn spring-boot:run

cd ../web
npm install
npm run dev
```

Open:

- Web: http://localhost:5173
- API health: http://localhost:8000/health
- Actuator health: http://localhost:8000/actuator/health
- Health: http://localhost:8000/health

## Deployment target

- Frontend: Vercel free tier
- Backend: Render free web service or Fly.io free allowance where available
- Database: Supabase Postgres free project
- Redis: Upstash free Redis or Render Redis alternative

See [docs/deployment.md](docs/deployment.md).
