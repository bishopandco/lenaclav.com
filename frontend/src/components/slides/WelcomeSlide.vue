<template>
  <SlideLayout
    :kicker="meta.kicker"
    :title="content.title"
    :body="content.body"
    :cta="content.cta"
    :variant="`slide--${meta.id}`"
    :is-active="props.isActive"
  />
</template>

<script setup lang="ts">
import SlideLayout from "./SlideLayout.vue";

const meta = {
  id: "welcome",
  kicker: "lenaclav.com",
};

const content = {
  title: "A minimal canvas<br />for ambitious ideas",
  body: "Swipe, tap, and scroll through a focused vertical story built for modern devices.",
  cta: {
    label: "Explore the repo",
    href: "https://github.com/bishopandco/lenaclav.com",
  },
};

const props = defineProps<{ isActive: boolean }>();
</script>

<style scoped>
:deep(.slide--welcome) {
  background: radial-gradient(circle at top, #1f2937, #0f172a);
  color: #e2e8f0;
}
</style>
