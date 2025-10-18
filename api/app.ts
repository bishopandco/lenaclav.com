import { Hono } from "hono";
import type { Context, Next } from "hono";
import { registerRoutes } from "./routes";
import { registerApp } from "./register";

const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.info(`${c.req.method} ${c.req.path} -> ${c.res.status} (${duration}ms)`);
};

export const createApp = () => {
  const app = new Hono();

  app.use("*", requestLogger);

  registerApp(app);
  registerRoutes(app);

  return app;
};
