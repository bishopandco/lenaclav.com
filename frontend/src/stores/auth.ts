import { reactive, computed, toRefs } from "vue";
import { API_BASE_URL } from "../lib/env";

type SessionPayload = {
  token: string;
  refreshToken: string;
  expiresAt: number;
};

type WhoAmIResponse = {
  decoded: Record<string, unknown>;
};

type StoredSession = SessionPayload & {
  username?: string | null;
  profile?: Record<string, unknown> | null;
};

const STORAGE_KEY = "lenaclav.auth.session";

const isBrowser = typeof window !== "undefined";

const readStoredSession = (): StoredSession | null => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (error) {
    console.warn("Unable to read stored auth session:", error);
  }
  return null;
};

const persistSession = (data: StoredSession | null) => {
  if (!isBrowser) return;
  if (!data) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const initial = readStoredSession();

const state = reactive({
  token: initial?.token ?? null as string | null,
  refreshToken: initial?.refreshToken ?? null as string | null,
  expiresAt: initial?.expiresAt ?? null as number | null,
  username: initial?.username ?? null as string | null,
  profile: initial?.profile ?? null as Record<string, unknown> | null,
  loading: false,
  refreshing: false,
});

const isAuthenticated = computed(
  () =>
    !!state.token &&
    typeof state.expiresAt === "number" &&
    state.expiresAt > Date.now()
);

const hasRefreshToken = computed(() => !!state.refreshToken);

const sessionSnapshot = (): StoredSession | null => {
  if (!state.token || !state.refreshToken || !state.expiresAt) {
    return null;
  }
  return {
    token: state.token,
    refreshToken: state.refreshToken,
    expiresAt: state.expiresAt,
    username: state.username,
    profile: state.profile,
  };
};

const withBaseUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};

const handleErrorResponse = async (response: Response) => {
  let message = `Request failed (${response.status})`;
  try {
    const data = await response.json();
    if (data && typeof data === "object" && "error" in data) {
      message = String(data.error);
    }
  } catch {
    // ignore parsing failure
  }
  throw new Error(message);
};

const fetchJson = async (path: string, init: RequestInit) => {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(withBaseUrl(path), {
    ...init,
    headers,
  });
  if (!response.ok) {
    await handleErrorResponse(response);
  }
  return response.json();
};

const updateSession = (payload: SessionPayload, username?: string) => {
  state.token = payload.token;
  state.refreshToken = payload.refreshToken;
  state.expiresAt = payload.expiresAt;
  if (username) {
    state.username = username;
  }
  persistSession(sessionSnapshot());
};

const clearSession = () => {
  state.token = null;
  state.refreshToken = null;
  state.expiresAt = null;
  state.profile = null;
  state.username = null;
  persistSession(null);
};

const fetchWhoAmI = async () => {
  if (!state.token) return;
  const response = await fetch(withBaseUrl("/auth/whoami"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.token}`,
    },
    body: JSON.stringify({ token: state.token }),
  });
  if (!response.ok) {
    return;
  }
  const payload = (await response.json()) as WhoAmIResponse;
  state.profile = payload?.decoded ?? null;
  persistSession(sessionSnapshot());
};

const refreshSession = async () => {
  if (!state.refreshToken || state.refreshing) return;
  state.refreshing = true;
  try {
    const payload = (await fetchJson("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: state.refreshToken }),
    })) as SessionPayload;
    updateSession(payload);
  } catch {
    clearSession();
  } finally {
    state.refreshing = false;
  }
};

export const useAuthStore = () => {
  const login = async (identifier: string, password: string) => {
    state.loading = true;
    try {
      const payload = (await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: identifier, username: identifier, password }),
      })) as SessionPayload;
      updateSession(payload, identifier);
      await fetchWhoAmI();
    } finally {
      state.loading = false;
    }
  };

  const logout = () => {
    clearSession();
  };

  const register = async (email: string, phone: string, password: string) => {
    state.loading = true;
    try {
      await fetchJson("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, phone, password }),
      });
      state.username = email;
    } finally {
      state.loading = false;
    }
  };

  const confirm = async (email: string, code: string) => {
    await fetchJson("/auth/confirm", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  };

  const forgotPassword = async (email: string) => {
    await fetchJson("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    state.username = email;
  };

  const resetPassword = async (email: string, code: string, password: string) => {
    await fetchJson("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    });
  };

  const ensureSession = async () => {
    if (!state.token) return;
    if (!state.expiresAt || state.expiresAt <= Date.now()) {
      if (state.refreshToken) {
        await refreshSession();
      } else {
        clearSession();
      }
    }
  };

  const authenticateRequest = (headers: Headers) => {
    if (state.token) {
      headers.set("Authorization", `Bearer ${state.token}`);
    }
  };

  return {
    ...toRefs(state),
    isAuthenticated,
    hasRefreshToken,
    login,
    logout,
    register,
    confirm,
    forgotPassword,
    resetPassword,
    ensureSession,
    refreshSession,
    fetchWhoAmI,
    authenticateRequest,
  };
};
