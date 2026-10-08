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

## CI (`.github/workflows/ci.yml`)

On every pull request and push to `main`: lint → tests → build.
(Deployment is not set up yet.)

In production nginx serves the app and forwards `/api/*` to the `backend`
container (see `nginx.conf`).
