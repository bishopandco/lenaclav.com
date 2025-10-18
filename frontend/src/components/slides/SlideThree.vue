<template>
  <section
    id="merch"
    class="relative flex h-screen w-screen flex-none items-center justify-center overflow-hidden border border-black border-solid"
  >
    <video
      class="pointer-events-none absolute inset-0 h-full w-full object-cover"
      :src="videoSrc"
      autoplay
      muted
      loop
      playsinline
      aria-hidden="true"
    />
    <div class="absolute inset-0 bg-black/70" aria-hidden="true" />

    <div class="relative z-10 flex w-full max-w-6xl flex-col gap-12 px-6 pt-24 text-white md:px-12 md:pt-32">
      <header class="space-y-4">
        <p class="text-xs uppercase tracking-[0.4em] text-white/60">Coming Soon</p>
        <h2 class="text-4xl font-semibold tracking-wide md:text-5xl">Merch</h2>
        <p class="text-sm text-white/70 md:text-base">
          These placeholders hold the line for the drop: tactile pieces, intentional packaging, limited
          counts. Use them to plan product photography and checkout flows.
        </p>
      </header>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in merchItems"
          :key="item.id"
          class="group flex h-full flex-col overflow-hidden rounded border border-white/15 bg-white/5 backdrop-blur"
        >
          <div class="relative h-44 bg-black/20">
            <div
              class="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-white/25 transition group-hover:text-white/50"
            >
              {{ item.assetLabel }}
            </div>
          </div>
          <div class="flex flex-1 flex-col gap-4 p-6">
            <div>
              <p class="text-xs uppercase tracking-[0.35em] text-white/50">{{ item.category }}</p>
              <h3 class="mt-2 text-lg font-semibold text-white">{{ item.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-white/75">{{ item.description }}</p>
            </div>
            <div class="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
              <span>{{ item.price }}</span>
              <span>{{ item.status }}</span>
            </div>
            <button
              type="button"
              class="mt-3 w-full rounded-full border border-white/60 px-5 py-2 text-xs uppercase tracking-[0.35em] text-white transition hover:border-white hover:bg-white/10"
            >
              {{ item.cta }}
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import videoSrc from "../../assets/ScreenRecording_10-16-2025 12-54-56_1.mp4";

defineProps<{ isActive: boolean }>();

const merchItems = [
  {
    id: "capsule-hoodie",
    category: "Drop 01",
    title: "Signature Hoodie FPO",
    description: "Heavyweight, overstated hood with tonal embroidery and hidden pocket for backstage wristbands.",
    price: "$90 FPO",
    status: "Limited",
    cta: "Preview",
    assetLabel: "FPO IMAGE",
  },
  {
    id: "motion-poster",
    category: "Print",
    title: "Motion Poster Set",
    description: "Three lenticular prints that shift with the beat—a physical keep of the digital visuals.",
    price: "$35 FPO",
    status: "Pre-Order",
    cta: "Join List",
    assetLabel: "FPO ART",
  },
  {
    id: "tour-pack",
    category: "Bundle",
    title: "Tour Survival Pack",
    description: "Reusable bottle, lyric zine, and a scratch-off card that reveals secret coordinates.",
    price: "$120 FPO",
    status: "Coming Soon",
    cta: "Notify Me",
    assetLabel: "FPO MOCK",
  },
  {
    id: "vinyl",
    category: "Vinyl",
    title: "Debut Pressing",
    description: "Clear vinyl with etched B-side artwork. Includes QR for a hidden live set recording.",
    price: "$45 FPO",
    status: "Variant 001",
    cta: "Hold Copy",
    assetLabel: "FPO VINYL",
  },
  {
    id: "tee",
    category: "Essentials",
    title: "Uniform Tee",
    description: "Boxy fit, micro-print chest hit, giant back graphic overlay. Screen printed locally.",
    price: "$45 FPO",
    status: "In Production",
    cta: "Preview",
    assetLabel: "FPO FABRIC",
  },
  {
    id: "accessory",
    category: "Accessory",
    title: "Signal Bracelet",
    description: "Industrial chain with removable tag that doubles as a USB drive for future drops.",
    price: "$60 FPO",
    status: "Concept",
    cta: "Vote",
    assetLabel: "FPO CLOSEUP",
  },
] as const;
</script>
