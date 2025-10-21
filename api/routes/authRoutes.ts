import { Hono, Context } from "hono";
import {
  register,
  confirmUser,
  login,
  refreshAccessToken,
  verifyJWT,
  deleteUser,
  listCognitoUsers,
  adminDeleteUser,
  countUsers,
  forgotPassword,
  resetPassword,
} from "../controllers/AuthController";
import { UserModel } from "../models/UserModel";

const authRoutes = new Hono();

authRoutes.post("/register", async (c: Context) => {
  const { email, phone, password } = await c.req.json();
  const result = await register(email, phone, password);
  try {
    await UserModel.create({ username: email, email });
  } catch {}
  return c.json({ message: "User registered", result });
});

authRoutes.post("/confirm", async (c: Context) => {
  const { email, code } = await c.req.json();
  const result = await confirmUser(email, code);
  return c.json({ message: "User confirmed", result });
});

authRoutes.post("/login", async (c: Context) => {
  const { email, username, password } = await c.req.json();
  const id = email || username;
  const { token, refreshToken, expiresAt } = await login(id, password);
  try {
    const existing = await UserModel.findByUsername(id);
    if (!existing) {
      await UserModel.create({ username: id, email: id });
    }
  } catch {}
  return c.json({ token, refreshToken, expiresAt });
});

authRoutes.post("/refresh", async (c: Context) => {
  const { refreshToken } = await c.req.json();
  const { token, expiresAt } = await refreshAccessToken(refreshToken);
  return c.json({ token, expiresAt });
});

authRoutes.post("/whoami", async (c: Context) => {
  const { token } = await c.req.json();
  const decoded = await verifyJWT(token);
  return c.json({ decoded });
});

authRoutes.post("/delete", async (c: Context) => {
  const { accessToken } = await c.req.json();
  const result = await deleteUser(accessToken);
  return c.json({ message: "User deleted", result });
});

authRoutes.post("/forgot-password", async (c: Context) => {
  const { email } = await c.req.json();
  const result = await forgotPassword(email);
  return c.json({ message: "Code sent", result });
});

authRoutes.post("/reset-password", async (c: Context) => {
  const { email, code, password } = await c.req.json();
  const result = await resetPassword(email, code, password);
  return c.json({ message: "Password reset", result });
});

authRoutes.get("/users", async (c: Context) => {
  const q = c.req.query();
  const limit = q.limit ? parseInt(q.limit as string, 10) : 10;
  const cursor = (q.cursor as string) || undefined;
  const result = await listCognitoUsers(limit, cursor);
  return c.json(result);
});

authRoutes.get("/users/_count", async (c: Context) => {
  const total = await countUsers();
  return c.json({ total });
});

authRoutes.post("/users/confirm", async (c: Context) => {
  const { username } = await c.req.json();
  const result = await confirmUser(username);
  return c.json({ message: "User confirmed", result });
});

authRoutes.delete("/users/:username", async (c: Context) => {
  const username = c.req.param("username");
  const result = await adminDeleteUser(username);
  return c.json({ message: "User deleted", result });
});

export default authRoutes;
