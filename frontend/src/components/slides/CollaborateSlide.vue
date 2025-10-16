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
  id: "collaborate",
  kicker: "Collaborate",
};

const content = {
  title: "Bring teams together<br />around shared context",
  body: "Slides keep the narrative tight while offering room for deep dives and demos.",
};

const props = defineProps<{ isActive: boolean }>();
</script>

<style scoped>
:deep(.slide--collaborate) {
  background: radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.45), transparent 55%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.35), transparent 55%),
    #111827;
}
</style>
