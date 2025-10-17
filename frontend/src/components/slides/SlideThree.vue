<template>
  <section
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

    <div class="relative z-10">
      <p class="text-6xl font-bold text-white drop-shadow">What do you want to say?</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import videoSrc from "../../assets/ScreenRecording_10-16-2025 12-54-56_1.mp4";

defineProps<{ isActive: boolean }>();
</script>
