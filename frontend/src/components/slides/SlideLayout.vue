<template>
  <section class="slide" :class="[variant, { active: isActive }]">
    <div class="slide__content">
      <p class="slide__kicker">{{ kicker }}</p>
      <h1 v-html="title" />
      <p class="slide__body">{{ body }}</p>
      <a
        v-if="cta"
        class="slide__cta"
        :href="cta.href"
        target="_blank"
        rel="noreferrer"
      >
        {{ cta.label }}
      </a>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Cta {
  label: string;
  href: string;
}

interface Props {
  kicker: string;
  title: string;
  body: string;
  variant: string;
  isActive: boolean;
  cta?: Cta;
}

defineProps<Props>();
</script>

<style scoped>
.slide {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2.5rem, 6vw, 6rem);
  box-sizing: border-box;
}

.slide__content {
  max-width: min(640px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: #e2e8f0;
}

.slide__kicker {
  margin: 0;
  letter-spacing: 0.2em;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.7);
}

.slide h1 {
  margin: 0;
  font-size: clamp(2.6rem, 8vw, 4.5rem);
  line-height: 1.1;
  font-weight: 700;
}

.slide__body {
  margin: 0;
  font-size: clamp(1rem, 4vw, 1.3rem);
  line-height: 1.5;
  color: rgba(226, 232, 240, 0.85);
}

.slide__cta {
  align-self: flex-start;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.85);
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(226, 232, 240, 0.4);
  transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
}

.slide__cta:hover,
.slide__cta:focus {
  background: rgba(226, 232, 240, 0.15);
  border-color: rgba(226, 232, 240, 0.7);
  transform: translateY(-1px);
}
</style>
