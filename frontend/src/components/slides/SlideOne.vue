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
          The tour calendar is still FPO, but here’s how the energy is shaping up. Dates,
          venues, and vibe checks are placeholders—swap in final details when they’re locked.
        </p>
      </header>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="event in events"
          :key="event.id"
          class="flex h-full flex-col rounded border border-white/20 bg-white/5 p-6 backdrop-blur"
        >
          <p class="text-xs uppercase tracking-[0.35em] text-white/60">{{ event.dateLabel }}</p>
          <h3 class="mt-4 text-xl font-semibold">{{ event.venue }}</h3>
          <p class="text-sm uppercase tracking-[0.3em] text-white/50">{{ event.city }}</p>
          <p class="mt-4 text-sm leading-relaxed text-white/80">{{ event.description }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-full border border-white/40 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/90 transition hover:border-white hover:bg-white/10"
            >
              {{ event.ctaPrimary }}
            </button>
            <button
              type="button"
              class="rounded-full border border-white/0 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/60 underline-offset-4 transition hover:text-white hover:underline"
            >
              {{ event.ctaSecondary }}
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import videoSrc from "../../assets/IMG_2778.mp4";

const props = defineProps<{ isActive: boolean; prefersReducedMotion: boolean }>();

const events = [
  {
    id: "bk-studio-night",
    dateLabel: "APR 24 · BROOKLYN",
    venue: "The FPO Studio Night",
    city: "BROOKLYN, NY",
    description:
      "Intimate release preview. Dark room, late start, heavy bass. Doors at FPO, set time at FPO.",
    ctaPrimary: "Tickets",
    ctaSecondary: "RSVP",
  },
  {
    id: "la-warehouse",
    dateLabel: "MAY 09 · LOS ANGELES",
    venue: "FPO Arts District Warehouse",
    city: "LOS ANGELES, CA",
    description:
      "Pop-up gallery performance in a borrowed warehouse. Visual projections, limited capacity, merch drop.",
    ctaPrimary: "Hold My Spot",
    ctaSecondary: "Add To Calendar",
  },
  {
    id: "chi-festival",
    dateLabel: "JUN 16 · CHICAGO",
    venue: "FPO Riverfront Festival",
    city: "CHICAGO, IL",
    description:
      "Outdoor stage takeover. Mid-set collaborator cameo, dripping visuals, afterparty somewhere secret.",
    ctaPrimary: "Waitlist",
    ctaSecondary: "Map",
  },
] as const;
</script>
