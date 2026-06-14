# Market Research Notes

Checked on 2026-06-14.

## Practical hiring signals to show

- TypeScript-heavy frontend engineering remains valuable because typed contracts improve maintainability in AI-assisted and team workflows.
- Java/Spring Boot remains a strong backend signal for enterprise, fintech, commerce, and platform roles.
- PostgreSQL, Docker, CI/CD, cloud deployment, and observability are still stronger employability signals than a single AI wrapper.
- AI is useful when it improves an existing workflow: summarization, triage, search, classification, and automation.
- Platform engineering trends favor systems that include operational visibility, background processing, and deployment discipline.

## Resulting stack

- React + Vite + TypeScript for production web UI.
- Spring Boot + Java 21 for backend APIs, persistence, validation, and production health endpoints.
- PostgreSQL/Supabase for relational data plus future vector search.
- Redis workers for async processing.
- Docker and GitHub Actions for repeatable delivery.
- Optional LLM feature flag for AI summaries.
