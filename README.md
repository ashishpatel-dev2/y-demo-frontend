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
  (`:latest` and `:<commit sha>`) → run `deploy.sh frontend` on the EC2 server via AWS SSM.
  Only the frontend container is restarted.

In production nginx serves the app and forwards `/api/*` to the `backend`
container (see `nginx.conf`).
