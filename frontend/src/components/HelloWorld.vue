<script setup lang="ts">
const props = defineProps<{
  message: string;
}>();

const links = [
  {
    label: "API health check",
    href: "http://localhost:8787/health",
  },
  {
    label: "Frontend dev server",
    href: "http://localhost:5173",
  },
];
</script>

<template>
  <section class="card">
    <h2>{{ props.message }}</h2>
    <p>Use the links below when both dev servers are running.</p>
    <ul>
      <li v-for="link in links" :key="link.href">
        <a :href="link.href" target="_blank" rel="noreferrer">
          {{ link.label }}
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card h2 {
  margin: 0;
}

.card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card a {
  color: #0284c7;
  text-decoration: none;
}

.card a:hover {
  text-decoration: underline;
}
</style>
