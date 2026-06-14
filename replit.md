# SpeakUp

A virtual classroom app where teachers create a room with a shareable 6-character code and students join anonymously to ask questions they're too shy to ask out loud.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter (routing) + Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/speakup/` — React frontend (port 8082 via SpeakUp workflow)
- `artifacts/api-server/src/routes/classes.ts` — all classroom/question API routes
- `lib/db/src/schema/index.ts` — DB schema (classrooms + questions tables)
- `lib/api-spec/openapi.yaml` — OpenAPI contract
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas

## Architecture decisions

- No auth — teacher/student role stored in localStorage (`speakup_session` key)
- 6-char uppercase classroom codes generated server-side
- Student questions are anonymous (no user identity stored)
- Frontend polls `/api/classes/:code/questions` every 3 seconds for live updates
- The `SpeakUp` console workflow (no `waitForPort`) runs the frontend — the artifact-managed `artifacts/speakup: web` workflow has a Replit probe bug for `kind="web"` artifacts and must stay failed

## Product

- **Teachers**: Create a classroom → get a 6-char code → share it → watch questions come in live → mark questions as answered
- **Students**: Enter the code → join anonymously → ask questions without fear of judgment
- **Classroom view**: Live polling every 3s, question upvoting, teacher controls

## Gotchas

- **Frontend workflow**: Always use the `SpeakUp` console workflow, NOT `artifacts/speakup: web`. The artifact-managed workflow has a Replit infrastructure bug where the port probe always fails (`DIDNT_OPEN_A_PORT`) even though Vite starts correctly. Fix: `configureWorkflow({ name: "SpeakUp", command: "PORT=8082 BASE_PATH=/ pnpm --filter @workspace/speakup run dev", outputType: "console", autoStart: true })` — no `waitForPort`.
- The `artifacts/speakup: web` workflow's `[services.env]` now uses PORT=8083 to avoid conflicting with the SpeakUp console workflow on port 8082.
- `pnpm run typecheck` must pass before deploying.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
