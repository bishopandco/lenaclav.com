import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const ensureApiUrlEnv = () => {
  if (process.env.VITE_API_URL) {
    return;
  }

  const outputsUrl = new URL("../.sst/outputs.json", import.meta.url);

  if (!existsSync(outputsUrl)) {
    return;
  }

  try {
    const outputs = JSON.parse(readFileSync(outputsUrl, "utf-8")) as {
      apiUrl?: string;
    };
    const apiUrl = outputs.apiUrl;
    if (typeof apiUrl === "string" && apiUrl.length > 0) {
      process.env.VITE_API_URL = apiUrl.replace(/\/$/, "");
    }
  } catch (error) {
    console.warn(
      "Unable to read .sst/outputs.json for VITE_API_URL fallback:",
      error,
    );
  }
};

ensureApiUrlEnv();

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
