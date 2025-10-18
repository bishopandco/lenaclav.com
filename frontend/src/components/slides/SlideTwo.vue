<template>
  <section
    id="contact"
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
    <div class="absolute inset-0 bg-black/75" aria-hidden="true" />

    <div class="relative z-10 flex w-full max-w-5xl flex-col gap-12 px-6 pt-24 text-white md:px-12 md:pt-32">
      <header class="space-y-4">
        <p class="text-xs uppercase tracking-[0.4em] text-white/60">Say Hey</p>
        <h2 class="text-4xl font-semibold tracking-wide md:text-5xl">Contact</h2>
        <p class="text-sm text-white/70 md:text-base">
          This inbox is holding space for future booking, press, and collab energy. Drop FPO
          details now so real messages have a place to land later.
        </p>
      </header>

      <div class="grid gap-10 md:grid-cols-[1.1fr,1fr]">
        <div class="space-y-8 text-sm text-white/75">
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-white/50">Management</p>
            <p class="mt-2 text-base text-white/90">FPO Agency</p>
            <a class="mt-1 block text-white/70 underline-offset-4 hover:text-white hover:underline" href="mailto:management@fpo.lena">
              management@fpo.lena
            </a>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-white/50">Booking</p>
            <p class="mt-2 text-base text-white/90">FPO Touring</p>
            <a class="mt-1 block text-white/70 underline-offset-4 hover:text-white hover:underline" href="mailto:shows@fpo.lena">
              shows@fpo.lena
            </a>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-white/50">Press</p>
            <a class="mt-2 block text-white/70 underline-offset-4 hover:text-white hover:underline" href="mailto:press@fpo.lena">
              press@fpo.lena
            </a>
            <p class="mt-2 max-w-xs text-white/60">
              Pitch decks, talking points, and hi-res assets will live here once the drop is real.
            </p>
          </div>
        </div>

        <form class="space-y-5" action="#" method="post" novalidate>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-white/60" for="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              name="name"
              placeholder="FPO Name"
              class="w-full rounded border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/50 focus:outline-none"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-white/60" for="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              placeholder="fpo@email.com"
              class="w-full rounded border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/50 focus:outline-none"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-white/60" for="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="4"
              placeholder="Booking, press, or collab notes go here."
              class="w-full rounded border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/50 focus:outline-none"
            ></textarea>
          </div>
          <button
            type="submit"
            class="w-full rounded-full border border-white/60 px-6 py-3 text-xs uppercase tracking-[0.35em] text-white transition hover:border-white hover:bg-white/10 md:w-auto"
          >
            Send FPO Message
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import videoSrc from "../../assets/ScreenRecording_04-06-2025 00-08-43_1.mp4";

defineProps<{ isActive: boolean }>();
</script>
