import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

const GA_MEASUREMENT_ID = "G-QWSBTLWWEV";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

const loadAnalytics = () => {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const gtag = (...args: unknown[]) => {
    dataLayer.push(args);
  };

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
};

if (import.meta.env.PROD) {
  loadAnalytics();
}

createApp(App).mount("#app");
