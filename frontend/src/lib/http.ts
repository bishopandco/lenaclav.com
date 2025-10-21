import { API_BASE_URL } from "./env";
import { useAuthStore } from "../stores/auth";

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};

const mergeHeaders = (existing: HeadersInit | undefined) => {
  if (!existing) return new Headers();
  if (existing instanceof Headers) return new Headers(existing);
  return new Headers(existing);
};

export const apiFetch = async (path: string, init: RequestInit = {}) => {
  const auth = useAuthStore();
  await auth.ensureSession();

  const headers = mergeHeaders(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  auth.authenticateRequest(headers);

  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  let response = await fetch(buildUrl(path), requestInit);
  if (response.status === 401 && auth.hasRefreshToken.value) {
    await auth.refreshSession();
    const retryHeaders = mergeHeaders(init.headers);
    if (!retryHeaders.has("Accept")) {
      retryHeaders.set("Accept", "application/json");
    }
    if (init.body && typeof init.body === "string" && !retryHeaders.has("Content-Type")) {
      retryHeaders.set("Content-Type", "application/json");
    }
    auth.authenticateRequest(retryHeaders);
    response = await fetch(buildUrl(path), {
      ...init,
      headers: retryHeaders,
    });
    if (response.status === 401) {
      auth.logout();
    }
  }
  return response;
};
