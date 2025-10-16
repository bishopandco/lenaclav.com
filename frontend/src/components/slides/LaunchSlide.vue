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
  id: "launch",
  kicker: "Launch",
};

const content = {
  title: "Progressive by default,<br />delightful by design",
  body: "Customize the palette, add interactions, and turn this scaffold into your flagship experience.",
  cta: {
    label: "Start a new story",
    href: "mailto:hello@lenaclav.com",
  },
};

const props = defineProps<{ isActive: boolean }>();
</script>

<style scoped>
:deep(.slide--launch) {
  background: radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.4), transparent 60%),
    radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.35), transparent 65%),
    #1e293b;
}
</style>
