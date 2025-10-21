import { Hono, Context } from "hono";
import { UserModel } from "../models/UserModel";

/**
 * Controller providing CRUD access to user records.
 */
export class UserController {
  static routes(app: Hono) {
    app.get("/users", async (c: Context) => {
      const q = c.req.query();
      const cursor = (q.cursor as string) || undefined;
      const size = q.pageSize ? parseInt(q.pageSize as string, 10) : 10;
      const result = await UserModel.list(cursor, size);
      return c.json(result);
    });

    app.get("/users/_count", async (c: Context) => {
      const total = await UserModel.count();
      return c.json({ total });
    });

    app.get("/users/:user", async (c: Context) => {
      const id = c.req.param("user");
      const item = await UserModel.get({ user: id });
      if (!item) {
        return c.notFound();
      }
      return c.json(item);
    });

    app.post("/users", async (c: Context) => {
      const data = await c.req.json();
      const created = await UserModel.create(data as Record<string, unknown>);
      return c.json(created, 201);
    });

    app.patch("/users", async (c: Context) => {
      const updates = await c.req.json();
      const updated = await UserModel.update(updates as Record<string, unknown>);
      return c.json(updated, 200);
    });

    app.delete("/users/:user", async (c: Context) => {
      const id = c.req.param("user");
      const deleted = await UserModel.delete(id);
      return c.json(deleted, 200);
    });
  }
}
