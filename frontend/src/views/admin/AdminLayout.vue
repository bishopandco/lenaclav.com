<template>
  <div class="admin-layout">
    <header class="admin-header">
      <RouterLink class="admin-header__logo" to="/">LENA CLAV</RouterLink>
      <nav class="admin-nav" aria-label="Admin navigation">
        <RouterLink class="admin-nav__link" to="/admin/blogs">Blog Posts</RouterLink>
        <RouterLink class="admin-nav__link" to="/blog">View Site</RouterLink>
      </nav>
    </header>

    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #020617;
  color: #e2e8f0;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: rgba(2, 6, 23, 0.85);
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.admin-header__logo {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.55rem;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
}

.admin-nav {
  display: flex;
  gap: 1.5rem;
}

.admin-nav__link {
  font-size: 0.85rem;
  letter-spacing: 0.18rem;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
  opacity: 0.7;
  transition: opacity 150ms ease;
}

.admin-nav__link.router-link-active {
  opacity: 1;
}

.admin-nav__link:hover {
  opacity: 0.95;
}

.admin-main {
  flex: 1;
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

@media (max-width: 640px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding-inline: 1rem;
  }

  .admin-nav {
    gap: 1rem;
  }
}
</style>
