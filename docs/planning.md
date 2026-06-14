# LaunchOps Planning

## Positioning

LaunchOps is not an AI demo. It is a cloud-native operations SaaS with an optional AI assistant.
The goal is to show that a solo developer can design product workflows, backend systems, data models, deployment paths, and operational concerns.

## Core modules

1. Event ingestion
   - Accept product events from client SDKs or server-side calls.
   - Store raw events for auditability.
   - Produce daily aggregate metrics.

2. Analytics dashboard
   - Activation, retention proxy, error rate, latency, and account risk.
   - Useful for product and engineering discussions.

3. Incident operations
   - Detect incident candidates from error spikes.
   - Track severity, owner, timeline, mitigation, and postmortem status.

4. Workflow automation
   - Background jobs process events and create operational tasks.
   - Redis-backed queue keeps expensive work outside the request path.

5. Optional AI intelligence
   - Summarize incidents from events and timeline entries.
   - Generate customer-facing status updates.
   - Keep AI as enhancement, not dependency.

## Interview narrative

- I chose Postgres/Supabase because most startups need relational consistency and managed operations before exotic infrastructure.
- I used Spring Boot because Java/Spring is still a strong backend hiring signal, especially for enterprise and platform teams.
- I separated frontend and backend so each can deploy independently on free infrastructure.
- I added Redis workers because production systems should move analytics and automation off the request path.
- I included observability and CI from day one because production engineering is more than shipping UI.
