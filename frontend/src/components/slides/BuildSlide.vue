<template>
  <SlideLayout
    :kicker="meta.kicker"
    :title="content.title"
    :body="content.body"
    :variant="`slide--${meta.id}`"
    :is-active="props.isActive"
  />
</template>

<script setup lang="ts">
import SlideLayout from "./SlideLayout.vue";

const meta = {
  id: "build",
  kicker: "Build",
};

const content = {
  title: "Ship faster<br />with a fearless workflow",
  body: "Combine the Vue frontend with a Hono API and deploy with confidence on SST.",
};

const props = defineProps<{ isActive: boolean }>();
</script>

<style scoped>
:deep(.slide--build) {
  background: radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.3), transparent 45%),
    radial-gradient(circle at 80% 20%, rgba(249, 168, 212, 0.35), transparent 55%),
    #0f172a;
}
</style>
