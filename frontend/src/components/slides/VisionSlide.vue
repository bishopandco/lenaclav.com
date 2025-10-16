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
  id: "vision",
  kicker: "Vision",
};

const content = {
  title: "Design bold experiences<br />with obsessive detail",
  body: "Start from a clean, responsive foundation that celebrates full-screen storytelling.",
};

const props = defineProps<{ isActive: boolean }>();
</script>

<style scoped>
:deep(.slide--vision) {
  background: radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.4), transparent 55%),
    radial-gradient(circle at 70% 70%, rgba(34, 197, 94, 0.35), transparent 60%),
    #111827;
}
</style>
