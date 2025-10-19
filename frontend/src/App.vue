<template>
  <div
    class="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black text-white"
  >
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_65%)]" aria-hidden="true" />

    <div class="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
      <p class="text-xs uppercase tracking-[0.5em] text-white/40">Lena Clav</p>
      <h1 class="text-4xl font-semibold tracking-[0.1em] md:text-5xl">Coming Soon</h1>
      <div class="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/30">
        <span class="inline-block h-px w-10 bg-white/10" aria-hidden="true" />
        <span>Stay Tuned</span>
        <span class="inline-block h-px w-10 bg-white/10" aria-hidden="true" />
      </div>
      <a
        class="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:border-white/60 hover:text-white"
        href="https://www.instagram.com/lenaclav_"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5 fill-current" aria-hidden="true">
          <path
            d="M7 3a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5H7zm0 2h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zm10 1a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2h-1zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
          />
        </svg>
      </a>
      <a
        class="mt-8 flex w-full max-w-sm items-center justify-between rounded-md border border-white/15 bg-white/5 px-5 py-4 text-left text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
        href="https://open.spotify.com/artist/4ovWdelZlMNykeM9H6Zl8l"
        target="_blank"
        rel="noreferrer"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-white/50">Listen</p>
          <p class="mt-1 text-sm font-medium tracking-wide text-white">Lena Clav on Spotify</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-current" aria-hidden="true">
          <path
            d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm4.5 14.35a.75.75 0 0 1-1.03.27 8.83 8.83 0 0 0-8.55 0 .75.75 0 0 1-.75-1.3 10.33 10.33 0 0 1 10.05 0 .75.75 0 0 1 .28 1.03Zm1.4-3.14a.94.94 0 0 1-1.29.35 11.78 11.78 0 0 0-11.21 0 .94.94 0 0 1-.94-1.64 13.7 13.7 0 0 1 13.08 0 .94.94 0 0 1 .36 1.29Zm.13-3.25a1.13 1.13 0 0 1-1.55.42 14.7 14.7 0 0 0-13.82 0 1.13 1.13 0 1 1-1.13-1.94 16.93 16.93 0 0 1 16.08 0 1.12 1.12 0 0 1 .42 1.52Z"
          />
        </svg>
      </a>
      <a
        class="mt-3 flex w-full max-w-sm items-center justify-between rounded-md border border-white/15 bg-white/5 px-5 py-4 text-left text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
        href="https://open.spotify.com/album/6qNnTJpOPCD4wsDWZIrxe1?si=GF639nYyR4e5BO_nOz1A8g"
        target="_blank"
        rel="noreferrer"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-white/50">Stream</p>
          <p class="mt-1 text-sm font-medium tracking-wide text-white">Latest Release</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-current" aria-hidden="true">
          <path
            d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm4.5 14.35a.75.75 0 0 1-1.03.27 8.83 8.83 0 0 0-8.55 0 .75.75 0 0 1-.75-1.3 10.33 10.33 0 0 1 10.05 0 .75.75 0 0 1 .28 1.03Zm1.4-3.14a.94.94 0 0 1-1.29.35 11.78 11.78 0 0 0-11.21 0 .94.94 0 0 1-.94-1.64 13.7 13.7 0 0 1 13.08 0 .94.94 0 0 1 .36 1.29Zm.13-3.25a1.13 1.13 0 0 1-1.55.42 14.7 14.7 0 0 0-13.82 0 1.13 1.13 0 1 1-1.13-1.94 16.93 16.93 0 0 1 16.08 0 1.12 1.12 0 0 1 .42 1.52Z"
          />
        </svg>
      </a>
      <a
        class="mt-3 flex w-full max-w-sm items-center justify-between rounded-md border border-white/15 bg-white/5 px-5 py-4 text-left text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
        href="https://open.spotify.com/album/3ue9yVqsUfgun7QNO2RdXG?si=7LLScP6xQRGQRI7KcJfBvg"
        target="_blank"
        rel="noreferrer"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-white/50">Stream</p>
          <p class="mt-1 text-sm font-medium tracking-wide text-white">Past Release</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-current" aria-hidden="true">
          <path
            d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm4.5 14.35a.75.75 0 0 1-1.03.27 8.83 8.83 0 0 0-8.55 0 .75.75 0 0 1-.75-1.3 10.33 10.33 0 0 1 10.05 0 .75.75 0 0 1 .28 1.03Zm1.4-3.14a.94.94 0 0 1-1.29.35 11.78 11.78 0 0 0-11.21 0 .94.94 0 0 1-.94-1.64 13.7 13.7 0 0 1 13.08 0 .94.94 0 0 1 .36 1.29Zm.13-3.25a1.13 1.13 0 0 1-1.55.42 14.7 14.7 0 0 0-13.82 0 1.13 1.13 0 1 1-1.13-1.94 16.93 16.93 0 0 1 16.08 0 1.12 1.12 0 0 1 .42 1.52Z"
          />
        </svg>
      </a>
    </div>
  </div>
</template>
