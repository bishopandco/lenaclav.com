<template>
  <main
    ref="viewportRef"
    class="viewport"
    tabindex="0"
    aria-live="polite"
    @wheel="handleWheel"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @keydown="handleKey"
  >
    <div class="track" :style="trackStyle">
      <component
        v-for="(slide, index) in slides"
        :key="slide.id"
        :is="slide.component"
        :is-active="index === activeIndex"
      />
    </div>

    <nav class="indicator" aria-label="Slide navigation">
      <button
        v-for="(slide, index) in slides"
        :key="`indicator-${slide.id}`"
        type="button"
        class="indicator__dot"
        :class="{ active: index === activeIndex }"
        @click="goToSlide(index)"
        :aria-label="`Go to ${slide.kicker}`"
      />
    </nav>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { slideDefinitions } from "./components/slides";
import type { SlideDefinition } from "./components/slides";

const slides: SlideDefinition[] = slideDefinitions;

const activeIndex = ref(0);
const viewportRef = ref<HTMLElement | null>(null);
const transitionMs = 500;
const swipeThreshold = 48;
const wheelThreshold = 120;
const lockBufferMs = 160;

let interactionLock: ReturnType<typeof setTimeout> | null = null;
let touchStartY = 0;
let touchCurrentY = 0;
let wheelAccumulator = 0;
const currentTransitionMs = ref(transitionMs);

const totalSlides = slides.length;

const trackStyle = computed(() => ({
  transform: `translateY(-${activeIndex.value * 100}vh)`,
  "--transition-duration": `${currentTransitionMs.value}ms`,
}));

const releaseLock = () => {
  interactionLock = null;
  wheelAccumulator = 0;
};

const lockInteractions = (duration = transitionMs) => {
  if (interactionLock) {
    clearTimeout(interactionLock);
  }
  interactionLock = setTimeout(releaseLock, duration);
};

const goToSlide = (
  target: number,
  options?: { lockDuration?: number; transitionDuration?: number },
) => {
  const clamped = Math.max(0, Math.min(totalSlides - 1, target));
  if (clamped === activeIndex.value) {
    return;
  }

  currentTransitionMs.value = options?.transitionDuration ?? transitionMs;
  activeIndex.value = clamped;
  wheelAccumulator = 0;
  lockInteractions((options?.lockDuration ?? transitionMs) + lockBufferMs);
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  wheelAccumulator += event.deltaY;

  if (Math.abs(wheelAccumulator) < wheelThreshold) {
    return;
  }

  const direction = wheelAccumulator > 0 ? 1 : -1;
  wheelAccumulator = 0;
  const target = activeIndex.value + direction;
  if (target < 0 || target >= totalSlides) {
    return;
  }

  const duration = interactionLock
    ? Math.max(180, Math.round(currentTransitionMs.value * 0.65))
    : transitionMs;

  goToSlide(target, { transitionDuration: duration, lockDuration: duration });
};

const handleTouchStart = (event: TouchEvent) => {
  touchStartY = event.touches[0].clientY;
  touchCurrentY = touchStartY;
};

const handleTouchMove = (event: TouchEvent) => {
  touchCurrentY = event.touches[0].clientY;
};

const handleTouchEnd = () => {
  const delta = touchCurrentY - touchStartY;
  if (Math.abs(delta) < swipeThreshold || interactionLock) {
    return;
  }

  const direction = delta < 0 ? 1 : -1;
  goToSlide(activeIndex.value + direction);
};

const handleKey = (event: KeyboardEvent) => {
  if (interactionLock) {
    return;
  }

  if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    goToSlide(activeIndex.value + 1);
    return;
  }

  if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    goToSlide(activeIndex.value - 1);
  }
};

onMounted(async () => {
  await nextTick();
  viewportRef.value?.focus({ preventScroll: true });
});

onBeforeUnmount(() => {
  if (interactionLock) {
    clearTimeout(interactionLock);
  }
});
</script>

<style scoped>
.viewport {
  position: relative;
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #0f172a;
  color: #e2e8f0;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  outline: none;
  touch-action: none;
}

.track {
  flex: 1;
  transition: transform var(--transition-duration, 500ms)
    cubic-bezier(0.25, 0.8, 0.25, 1);
}

.indicator {
  position: absolute;
  top: 50%;
  right: clamp(1rem, 4vw, 2.5rem);
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.indicator__dot {
  appearance: none;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 2px solid rgba(226, 232, 240, 0.6);
  background: transparent;
  cursor: pointer;
  transition: transform 200ms ease, background 200ms ease, border-color 200ms ease;
}

.indicator__dot.active {
  transform: scale(1.2);
  background: rgba(226, 232, 240, 0.9);
  border-color: rgba(226, 232, 240, 0.9);
}

@media (max-width: 640px) {
  .indicator {
    right: 1rem;
    gap: 0.6rem;
  }

  .indicator__dot {
    width: 0.6rem;
    height: 0.6rem;
  }
}
</style>
