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
      <section
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="slide"
        :class="[`slide--${slide.id}`, { active: index === activeIndex }]"
      >
        <div class="slide__content">
          <p class="slide__kicker">{{ slide.kicker }}</p>
          <h1 v-html="slide.title" />
          <p class="slide__body">{{ slide.body }}</p>
          <a
            v-if="slide.cta"
            class="slide__cta"
            :href="slide.cta.href"
            target="_blank"
            rel="noreferrer"
          >
            {{ slide.cta.label }}
          </a>
        </div>
      </section>
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

type Slide = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  cta?: {
    label: string;
    href: string;
  };
};

const slides: Slide[] = [
  {
    id: "welcome",
    kicker: "lenaclav.com",
    title: "A minimal canvas<br />for ambitious ideas",
    body: "Swipe, tap, and scroll through a focused vertical story built for modern devices.",
    cta: {
      label: "Explore the repo",
      href: "https://github.com/bishopandco/lenaclav.com",
    },
  },
  {
    id: "vision",
    kicker: "Vision",
    title: "Design bold experiences<br />with obsessive detail",
    body: "Start from a clean, responsive foundation that celebrates full-screen storytelling.",
  },
  {
    id: "build",
    kicker: "Build",
    title: "Ship faster<br />with a fearless workflow",
    body: "Combine the Vue frontend with a Hono API and deploy with confidence on SST.",
  },
  {
    id: "collaborate",
    kicker: "Collaborate",
    title: "Bring teams together<br />around shared context",
    body: "Slides keep the narrative tight while offering room for deep dives and demos.",
  },
  {
    id: "launch",
    kicker: "Launch",
    title: "Progressive by default,<br />delightful by design",
    body: "Customize the palette, add interactions, and turn this scaffold into your flagship experience.",
    cta: {
      label: "Start a new story",
      href: "mailto:hello@lenaclav.com",
    },
  },
];

const activeIndex = ref(0);
const viewportRef = ref<HTMLElement | null>(null);
const transitionMs = 500;
const swipeThreshold = 48;
const wheelThreshold = 60;
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

.slide--welcome {
  background: radial-gradient(circle at top, #1f2937, #0f172a);
}

.slide--vision {
  background: radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.4), transparent 55%),
    radial-gradient(circle at 70% 70%, rgba(34, 197, 94, 0.35), transparent 60%),
    #111827;
}

.slide--build {
  background: radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.3), transparent 45%),
    radial-gradient(circle at 80% 20%, rgba(249, 168, 212, 0.35), transparent 55%),
    #0f172a;
}

.slide--collaborate {
  background: radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.45), transparent 55%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.35), transparent 55%),
    #111827;
}

.slide--launch {
  background: radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.4), transparent 60%),
    radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.35), transparent 65%),
    #1e293b;
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
