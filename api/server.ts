import { serve } from "@hono/node-server";
import { createApp } from "./app";

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const app = createApp();

serve({
  fetch: app.fetch,
  port,
});

console.log(`API available at http://localhost:${port}`);
