import { Context } from "hono";
import { verifyJWT } from "../controllers/AuthController";
import { UserModel } from "../models/UserModel";

export async function authMiddleware(c: Context, next: () => Promise<void>) {
  if (process.env.SKIP_AUTH === "true") {
    await next();
    return;
  }

  const authHeader = c.req.raw.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    await next();
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await verifyJWT(token);
    if (typeof decoded === "string" || !("username" in decoded)) {
      throw new Error("Invalid token payload");
    }
    const username = decoded.username as string;
    const user = await UserModel.findByUsername(username);
    const sessionUser = user
      ? { ...decoded, ...user }
      : { ...decoded, user: (decoded as any).sub };
    if ((decoded as any).roles_version) {
      const dbVersion = user?.rolesVersion ?? 0;
      const tokenVersion = parseInt((decoded as any).roles_version as string, 10);
      if (tokenVersion < dbVersion) {
        return c.json({ error: "Session expired" }, 401);
      }
    }
    c.set("user", sessionUser);
  } catch (error) {
    console.error("🔒 Error in authMiddleware:", (error as Error).message);
    return c.json({ error: (error as Error).message }, 401);
  }

  await next();
}
