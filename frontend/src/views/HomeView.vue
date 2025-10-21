<template>
  <div class="relative h-screen w-screen">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-white focus:outline focus:outline-2 focus:outline-white"
    >
      Skip to main content
    </a>

    <header class="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-black/60 px-6 py-4 text-white backdrop-blur">
      <div class="text-lg font-semibold tracking-widest">LENA CLAV</div>
      <nav aria-label="Primary">
        <ul class="flex items-center gap-3 text-sm uppercase tracking-wide">
          <li>
            <a
              href="#events"
              :class="['hover:underline transition-colors', navLinkClass('events')]"
              :aria-current="activeSlideId === 'events' ? 'page' : undefined"
              @click.prevent="handleNavClick('events')"
            >
              events
            </a>
          </li>
          <li aria-hidden="true">|</li>
          <li>
            <a
              href="#contact"
              :class="['hover:underline transition-colors', navLinkClass('contact')]"
              :aria-current="activeSlideId === 'contact' ? 'page' : undefined"
              @click.prevent="handleNavClick('contact')"
            >
              contact
            </a>
          </li>
          <li aria-hidden="true">|</li>
          <li>
            <a
              href="#merch"
              :class="['hover:underline transition-colors', navLinkClass('merch')]"
              :aria-current="activeSlideId === 'merch' ? 'page' : undefined"
              @click.prevent="handleNavClick('merch')"
            >
              merch
            </a>
          </li>
          <li aria-hidden="true">|</li>
          <li>
            <RouterLink class="hover:underline transition-colors" to="/blog">
              blog
            </RouterLink>
          </li>
          <li aria-hidden="true">|</li>
          <li v-if="auth.isAuthenticated.value">
            <RouterLink class="hover:underline transition-colors" to="/admin">
              admin
            </RouterLink>
          </li>
          <li v-else>
            <RouterLink class="hover:underline transition-colors" to="/signin">
              sign in
            </RouterLink>
          </li>
          <li v-if="auth.isAuthenticated.value" aria-hidden="true">|</li>
          <li v-if="auth.isAuthenticated.value">
            <button class="hover:underline transition-colors bg-transparent border-0 uppercase tracking-wide text-sm" type="button" @click="handleSignOut">
              sign out
            </button>
          </li>
        </ul>
      </nav>
    </header>

    <main
      id="main-content"
      ref="viewportRef"
      :class="[
        'relative flex h-full w-full overflow-hidden outline-none focus:outline-none',
        prefersReducedMotion ? 'touch-auto' : 'touch-none'
      ]"
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
          :prefers-reduced-motion="prefersReducedMotion"
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
          class="h-3 w-3 rounded-full border border-black transition"
          :class="index === activeIndex ? 'bg-black' : 'bg-transparent'"
          @click="goToSlide(index)"
          :aria-label="`Go to ${slide.kicker}`"
          :aria-current="index === activeIndex ? 'true' : undefined"
        />
      </nav>
    </main>

    <div class="pointer-events-none absolute left-6 bottom-6 flex flex-col gap-2 text-white">
      <p class="text-xs uppercase tracking-[0.35em] text-white/80">
        {{ progressLabel }}
      </p>
      <p class="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
        {{ instructionLabel }}
      </p>
    </div>

    <span class="sr-only" aria-live="polite">{{ liveStatus }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import type { SlideDefinition } from "../components/slides";
import { slideDefinitions } from "../components/slides";
import { useAuthStore } from "../stores/auth";

const slides: SlideDefinition[] = slideDefinitions;
const auth = useAuthStore();
const router = useRouter();

const activeIndex = ref(0);
const viewportRef = ref<HTMLElement | null>(null);
const prefersReducedMotion = ref(false);

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
const totalSlidesLabel = totalSlides.toString().padStart(2, "0");

const trackTransition = "cubic-bezier(0.25, 0.8, 0.25, 1)";

const activeSlide = computed(() => slides[activeIndex.value] ?? null);
const activeSlideId = computed(() => activeSlide.value?.id ?? null);

const trackStyle = computed(() => {
  const transform = `translateY(-${activeIndex.value * 100}vh)`;
  const transition = prefersReducedMotion.value
    ? "none"
    : `transform ${currentTransitionMs.value}ms ${trackTransition}`;
  return {
    transform,
    transition,
  };
});

const progressLabel = computed(() => {
  if (!activeSlide.value) {
    return "";
  }
  const current = (activeIndex.value + 1).toString().padStart(2, "0");
  return `${current} / ${totalSlidesLabel} — ${activeSlide.value.kicker}`;
});

const handleSignOut = () => {
  auth.logout();
  void router.push("/");
};

const instructionLabel = computed(() =>
  prefersReducedMotion.value
    ? "Use arrow keys or navigation links"
    : "Scroll, swipe, or use arrow keys",
);

const liveStatus = computed(() => {
  if (!activeSlide.value) {
    return "";
  }
  return `Slide ${activeIndex.value + 1} of ${totalSlides}: ${activeSlide.value.kicker}`;
});

const navLinkClass = (id: string) =>
  activeSlideId.value === id ? "text-white" : "text-white/70";

const releaseLock = () => {
  interactionLock = null;
  wheelAccumulator = 0;
};

const lockInteractions = (duration = transitionMs) => {
  if (prefersReducedMotion.value) {
    return;
  }
  if (interactionLock) {
    clearTimeout(interactionLock);
  }
  interactionLock = setTimeout(releaseLock, duration);
};

let isUpdatingHash = false;

const updateHashForIndex = (index: number) => {
  if (typeof window === "undefined") {
    return;
  }
  const slide = slides[index];
  if (!slide) {
    return;
  }
  const targetHash = `#${slide.id}`;
  if (window.location.hash === targetHash) {
    return;
  }
  isUpdatingHash = true;
  window.history.replaceState(null, "", targetHash);
  Promise.resolve().then(() => {
    isUpdatingHash = false;
  });
};

type SlideOptions = {
  lockDuration?: number;
  transitionDuration?: number;
  skipHashUpdate?: boolean;
};

const goToSlide = (target: number, options?: SlideOptions) => {
  const clamped = Math.max(0, Math.min(totalSlides - 1, target));
  if (clamped === activeIndex.value) {
    return;
  }

  const transitionDuration = options?.transitionDuration ?? (prefersReducedMotion.value ? 0 : transitionMs);
  currentTransitionMs.value = transitionDuration;
  activeIndex.value = clamped;
  wheelAccumulator = 0;
  lockInteractions((options?.lockDuration ?? transitionMs) + lockBufferMs);

  if (!options?.skipHashUpdate) {
    updateHashForIndex(clamped);
  }
};

const goToSlideById = (id: string, options?: SlideOptions) => {
  const index = slides.findIndex((slide) => slide.id === id);
  if (index === -1) {
    return;
  }
  goToSlide(index, options);
};

const handleNavClick = (id: string) => {
  goToSlideById(id);
  viewportRef.value?.focus({ preventScroll: true });
};

const handleWheel = (event: WheelEvent) => {
  if (prefersReducedMotion.value) {
    return;
  }
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
  if (prefersReducedMotion.value) {
    return;
  }
  touchStartY = event.touches[0].clientY;
  touchCurrentY = touchStartY;
};

const handleTouchMove = (event: TouchEvent) => {
  if (prefersReducedMotion.value) {
    return;
  }
  touchCurrentY = event.touches[0].clientY;
};

const handleTouchEnd = () => {
  if (prefersReducedMotion.value) {
    return;
  }
  const delta = touchCurrentY - touchStartY;
  if (Math.abs(delta) < swipeThreshold || interactionLock) {
    return;
  }

  const direction = delta < 0 ? 1 : -1;
  goToSlide(activeIndex.value + direction);
};

const handleKey = (event: KeyboardEvent) => {
  if (interactionLock && !prefersReducedMotion.value) {
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
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    goToSlide(0);
    return;
  }

  if (event.key === "End") {
    event.preventDefault();
    goToSlide(totalSlides - 1);
  }
};

let removeMotionListener: (() => void) | null = null;
let removeHashListener: (() => void) | null = null;

const onHashChange = () => {
  if (typeof window === "undefined" || isUpdatingHash) {
    return;
  }
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    updateHashForIndex(activeIndex.value);
    return;
  }
  goToSlideById(hash, {
    skipHashUpdate: true,
    transitionDuration: prefersReducedMotion.value ? 0 : transitionMs,
  });
};

onMounted(async () => {
  await nextTick();
  viewportRef.value?.focus({ preventScroll: true });

  if (typeof window === "undefined") {
    return;
  }

  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const applyMotionPreference = () => {
    prefersReducedMotion.value = media.matches;
  };
  applyMotionPreference();
  media.addEventListener("change", applyMotionPreference);
  removeMotionListener = () => {
    media.removeEventListener("change", applyMotionPreference);
  };

  window.addEventListener("hashchange", onHashChange);
  removeHashListener = () => {
    window.removeEventListener("hashchange", onHashChange);
  };

  if (window.location.hash) {
    onHashChange();
  } else {
    updateHashForIndex(activeIndex.value);
  }
});

watch(prefersReducedMotion, (value) => {
  currentTransitionMs.value = value ? 0 : transitionMs;
  if (value) {
    releaseLock();
  }
});

onBeforeUnmount(() => {
  if (interactionLock) {
    clearTimeout(interactionLock);
  }
  removeMotionListener?.();
  removeHashListener?.();
});
</script>
