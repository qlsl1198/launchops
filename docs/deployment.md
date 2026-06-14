# Deployment

## Frontend on Vercel, Netlify, or Cloudflare Pages

1. Create a Vercel project from this repository.
2. Set root directory to `apps/web`.
3. Add environment variable:
   - `VITE_API_URL=https://your-api-host`
4. Deploy.

## Backend on Render

1. Create a Web Service.
2. Root directory: `apps/api`
3. Runtime: Java
4. Build command:

```bash
mvn package -DskipTests
```

5. Start command:

```bash
java -jar target/api-0.1.0.jar
```

6. Add environment variables from `.env.example`.

## Database on Supabase

1. Create a free Supabase project.
2. Open SQL editor.
3. Run migrations in `supabase/migrations`.
4. Copy the connection string into `DATABASE_URL`.

## Redis

Use Upstash Redis or a Render Redis-compatible free option.
Set `REDIS_URL` in the backend environment.

## iOS

The iOS app can be distributed through TestFlight/App Store after Apple signing is configured.
Use `apps/ios/LaunchOps/fastlane/Fastfile` for the beta lane.
