import type { Hono } from "hono";
import { registerHealthRoutes } from "./health";
import authRoutes from "./authRoutes";

export const registerRoutes = (app: Hono) => {
  app.get("/", (c) =>
    c.json({
      message: "Welcome to the lenaclav.com API",
    }),
  );

  app.route("/auth", authRoutes);
  registerHealthRoutes(app);
};
