# lenaclav.com

A minimal monorepo that mirrors the structure of the `co-sign-hono` project with a focus on the frontend and API pieces only. The backend is powered by [Hono](https://hono.dev/) and managed with [SST](https://sst.dev/), while the frontend uses [Vite](https://vitejs.dev/) with Vue 3.

## Structure

- `api/` – Hono server with a request logger, health check, and welcome route.
- `frontend/` – Vue 3 single page app bootstrapped with Vite and a proxy to the API.
- `sst.config.ts` – SST app definition that wires the API function and frontend static site.
- `package.json` – shared scripts and dependencies for the API/SST layer.

## Getting started

From the repository root:

```bash
# Install API dependencies
npm install

# Install frontend dependencies
npm install --prefix frontend

# Start the API via SST (lambda-style local invoke)
npm run dev:api

# In a separate terminal, start the frontend (http://localhost:5173)
npm run dev:frontend
```

## Building

```bash
# Build the API to ./build
npm run build:api

# Build the frontend to ./frontend/dist
npm run build:frontend

# Deploy the SST stack
npm run deploy
```

Feel free to extend either side with routing, data models, or deployment infrastructure as the project evolves.
