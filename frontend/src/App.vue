<template>
  <main class="app">
    <header class="hero">
      <h1>lenaclav.com</h1>
      <p>Your project starter is ready with a frontend and API.</p>
      <a class="cta" href="https://github.com/bishopandco/lenaclav.com" target="_blank" rel="noreferrer">
        View Repository
      </a>
    </header>
    <section class="content">
      <HelloWorld message="Welcome to your Vue + Hono starter" />
    </section>
  </main>
</template>

<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 2rem;
  background: radial-gradient(circle at top, #f8fafc, #e2e8f0);
  color: #0f172a;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero h1 {
  font-size: 3rem;
  margin: 0;
}

.hero p {
  margin: 0;
  font-size: 1.1rem;
  color: #334155;
}

.cta {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  background: #0ea5e9;
  color: white;
  text-decoration: none;
  transition: background 0.2s ease;
}

.cta:hover {
  background: #0284c7;
}

.content {
  width: min(640px, 100%);
}
</style>
