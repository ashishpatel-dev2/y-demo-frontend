# Todo frontend (React + Vite, served by nginx)

## Local development

```bash
npm install
npm run dev        # http://localhost:5173, /api is proxied to http://localhost:5000
```

| Script | What it does |
|---|---|
| `npm run lint` | ESLint (incl. React hooks rules) |
| `npm test` | Component tests (Vitest + Testing Library, fetch is mocked) |
| `npm run build` | Production build into `dist/` |

## CI/CD (`.github/workflows/ci-cd.yml`)

- **Pull request / push:** lint → tests → build.
- **Push to `main` (after checks pass):** build image → push to ECR `todo-frontend`
  → register a new revision of [.aws/task-definition.json](.aws/task-definition.json)
  → roll the ECS service `todo-frontend-service` over to it.

On AWS the load balancer sends `/api/*` straight to the backend service and
everything else to this nginx container. The `/api/` block in `nginx.conf`
is only used when running both containers locally with docker compose.
