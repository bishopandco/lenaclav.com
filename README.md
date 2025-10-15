# lenaclav.com

A minimal monorepo that mirrors the structure of the `co-sign-hono` project with a focus on the frontend and API pieces only. The backend is powered by [Hono](https://hono.dev/) and the frontend uses [Vite](https://vitejs.dev/) with Vue 3.

## Structure

- `api/` – Hono server with a request logger, health check, and welcome route.
- `frontend/` – Vue 3 single page app bootstrapped with Vite and a proxy to the API.
- `package.json` – shared scripts and dependencies for the API layer.

## Getting started

From the repository root:

```bash
# Install API dependencies
npm install

# Install frontend dependencies
npm install --prefix frontend

# Start the API (http://localhost:8787)
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
```

Feel free to extend either side with routing, data models, or deployment infrastructure as the project evolves.
