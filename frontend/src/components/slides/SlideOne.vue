<template>
  <section
    id="events"
    class="relative flex h-screen w-screen flex-none items-center justify-center overflow-hidden border border-black border-solid bg-black"
  >
    <video
      v-if="!props.prefersReducedMotion"
      class="pointer-events-none absolute inset-0 h-full w-full object-cover"
      :src="videoSrc"
      autoplay
      muted
      loop
      playsinline
      aria-hidden="true"
    />
    <div v-else class="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-black/60" aria-hidden="true" />
    <div class="absolute inset-0 bg-black/70" aria-hidden="true" />

    <div
      class="relative z-10 flex w-full max-w-6xl flex-col gap-12 px-6 pt-28 text-white md:px-12 md:pt-32"
    >
      <header class="max-w-xl space-y-4">
        <p class="text-xs uppercase tracking-[0.4em] text-white/70">Upcoming</p>
        <h2 class="text-4xl font-semibold tracking-wide md:text-5xl">Events</h2>
        <p class="text-sm text-white/70 md:text-base">
          Tour drops update here first. Lock in the cities, rooms, and set times as new shows go
          live.
        </p>
      </header>

      <div
        v-if="state.loading"
        class="rounded border border-white/15 bg-white/5 p-6 text-sm uppercase tracking-[0.3em] text-white/70"
        role="status"
      >
        Loading events…
      </div>
      <div
        v-else-if="state.error"
        class="rounded border border-rose-200/40 bg-rose-500/10 p-6 text-sm uppercase tracking-[0.2em] text-rose-100"
        role="alert"
      >
        {{ state.error }}
      </div>
      <div
        v-else-if="displayEvents.length === 0"
        class="rounded border border-white/15 bg-white/5 p-6 text-sm uppercase tracking-[0.3em] text-white/70"
      >
        No upcoming events yet. Check back soon.
      </div>
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="event in displayEvents"
          :key="event.id"
          class="flex h-full flex-col rounded border border-white/20 bg-white/5 p-6 backdrop-blur"
        >
          <p class="text-xs uppercase tracking-[0.35em] text-white/60">
            {{ event.dateLabel }}
          </p>
          <h3 class="mt-4 text-xl font-semibold">{{ event.title }}</h3>
          <p class="text-sm uppercase tracking-[0.3em] text-white/50">
            {{ event.location }}
          </p>
          <p class="mt-4 text-sm leading-relaxed text-white/80">{{ event.description }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <span
              class="rounded-full border border-white/40 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/90"
            >
              {{ event.timeBadge }}
            </span>
            <span
              v-if="event.secondaryBadge"
              class="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/70"
            >
              {{ event.secondaryBadge }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import videoSrc from "../../assets/IMG_2778.mp4";
import { apiFetch } from "../../lib/http";

const props = defineProps<{ isActive: boolean; prefersReducedMotion: boolean }>();

type EventRecord = {
  event: string;
  title: string;
  description: string;
  location?: string | null;
  startAt?: string | null;
  endAt?: string | null;
};

type EventListResponse = {
  data?: EventRecord[];
};

const state = reactive({
  loading: true,
  error: null as string | null,
  events: [] as EventRecord[],
});

const fetchEvents = async () => {
  state.loading = true;
  state.error = null;
  try {
    const response = await apiFetch("/events");
    if (!response.ok) {
      throw new Error(`Unable to fetch events (${response.status})`);
    }
    const payload = (await response.json()) as EventListResponse;
    state.events = payload.data ?? [];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong loading events.";
    state.error = message;
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  void fetchEvents();
});

const parseDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }
  return new Date(timestamp);
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const makeDateLabel = (date: Date | null) => {
  if (!date) {
    return "DATE TBA";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const makeStartBadge = (date: Date | null) => {
  if (!date) {
    return "TIMING TBD";
  }
  return `Starts ${timeFormatter.format(date)}`;
};

const makeSecondaryBadge = (start: Date | null, end: Date | null) => {
  if (!end) {
    return "";
  }
  if (start && isSameDay(start, end)) {
    return `Ends ${timeFormatter.format(end)}`;
  }
  return `Through ${makeDateLabel(end)}`;
};

const sortedEvents = computed(() =>
  [...state.events].sort((a, b) => {
    const left = parseDate(a.startAt);
    const right = parseDate(b.startAt);
    const leftTime = left ? left.getTime() : Number.POSITIVE_INFINITY;
    const rightTime = right ? right.getTime() : Number.POSITIVE_INFINITY;
    return leftTime - rightTime;
  }),
);

const displayEvents = computed(() =>
  sortedEvents.value.map((event) => {
    const start = parseDate(event.startAt);
    const end = parseDate(event.endAt);
    return {
      id: event.event,
      title: event.title ?? "Untitled Event",
      description: event.description ?? "Details coming soon.",
      location: event.location?.trim() || "Location TBA",
      dateLabel: makeDateLabel(start),
      timeBadge: makeStartBadge(start),
      secondaryBadge: makeSecondaryBadge(start, end),
    };
  }),
);
</script>
