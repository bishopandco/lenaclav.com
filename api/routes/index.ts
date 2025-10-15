import type { Hono } from "hono";
import { registerHealthRoutes } from "./health";

export const registerRoutes = (app: Hono) => {
  app.get("/", (c) =>
    c.json({
      message: "Welcome to the lenaclav.com API",
    }),
  );

  registerHealthRoutes(app);
};
