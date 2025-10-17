<template>
  <div class="relative h-screen w-screen">
    <header class="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-black/60 px-6 py-4 text-white backdrop-blur">
      <div class="text-lg font-semibold tracking-widest">LENA CLAV</div>
      <nav aria-label="Primary">
        <ul class="flex items-center gap-3 text-sm uppercase tracking-wide">
          <li><a href="#events" class="hover:underline">events</a></li>
          <li aria-hidden="true">|</li>
          <li><a href="#contact" class="hover:underline">contact</a></li>
          <li aria-hidden="true">|</li>
          <li><a href="#merch" class="hover:underline">merch</a></li>
        </ul>
      </nav>
    </header>

    <main
      ref="viewportRef"
      class="relative flex h-full w-full overflow-hidden touch-none outline-none focus:outline-none"
      tabindex="0"
      aria-live="polite"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @keydown="handleKey"
    >
      <div class="flex h-full w-full flex-col" :style="trackStyle">
        <component
          v-for="(slide, index) in slides"
          :key="slide.id"
          :is="slide.component"
          :is-active="index === activeIndex"
        />
      </div>

      <nav
        class="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-3"
        aria-label="Slide navigation"
      >
        <button
          v-for="(slide, index) in slides"
          :key="`indicator-${slide.id}`"
          type="button"
          class="h-3 w-3 rounded-full border border-black"
          :class="{ 'bg-black': index === activeIndex }"
          @click="goToSlide(index)"
          :aria-label="`Go to ${slide.kicker}`"
        />
      </nav>
    </main>
  </div>
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

const trackTransition = "cubic-bezier(0.25, 0.8, 0.25, 1)";

const trackStyle = computed(() => ({
  transform: `translateY(-${activeIndex.value * 100}vh)`,
  transition: `transform ${currentTransitionMs.value}ms ${trackTransition}`,
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
