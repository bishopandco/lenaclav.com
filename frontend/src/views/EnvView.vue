<script setup lang="ts">
const viteEnvEntries = Object.entries(import.meta.env).filter(([key]) =>
  key.startsWith("VITE_"),
);
</script>

<template>
  <main class="env-view">
    <h1>Environment</h1>
    <p>The following values come from the Vite `VITE_*` environment variables.</p>

    <table v-if="viteEnvEntries.length > 0">
      <thead>
        <tr>
          <th scope="col">Key</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[key, value] in viteEnvEntries" :key="key">
          <td><code>{{ key }}</code></td>
          <td><code>{{ value }}</code></td>
        </tr>
      </tbody>
    </table>
    <p v-else>No VITE environment variables detected.</p>
  </main>
</template>

<style scoped>
.env-view {
  margin: 0 auto;
  max-width: 48rem;
  padding: 2rem 1rem;
}

table {
  border-collapse: collapse;
  margin-top: 1.5rem;
  width: 100%;
}

th,
td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

thead {
  background-color: #f8fafc;
}
</style>
