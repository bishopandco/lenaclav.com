const normalizeUrl = (input: string) => input.replace(/\/$/, "");

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!rawApiUrl || rawApiUrl === "undefined") {
  throw new Error(
    "VITE_API_URL is not defined. Ensure you launch the frontend through `sst dev 'npm run dev --prefix frontend'` or set VITE_API_URL manually.",
  );
}

export const API_BASE_URL = normalizeUrl(rawApiUrl);
