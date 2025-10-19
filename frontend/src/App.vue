<template>
  <div
    class="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black text-white"
  >
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_65%)]" aria-hidden="true" />

    <div class="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
      <p class="text-xs uppercase tracking-[0.5em] text-white/40">Lena Clav</p>
      <h1 class="text-4xl font-semibold tracking-[0.1em] md:text-5xl">Coming Soon</h1>
      <p class="max-w-md text-sm leading-relaxed text-white/70 md:text-base">
        The next chapter is in the works. Drop your email, stay close, and be first to know when the
        site goes live.
      </p>
      <form class="mt-4 flex w-full max-w-sm flex-col gap-3" action="#" method="post" novalidate>
        <label class="sr-only" for="notify-email">Email</label>
        <input
          id="notify-email"
          type="email"
          name="email"
          placeholder="name@email.com"
          class="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
        />
        <button
          type="submit"
          class="rounded-full border border-white/60 px-5 py-3 text-xs uppercase tracking-[0.4em] text-white transition hover:border-white hover:bg-white/10"
        >
          Notify Me
        </button>
      </form>
      <div class="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/30">
        <span class="inline-block h-px w-10 bg-white/10" aria-hidden="true" />
        <span>Stay Tuned</span>
        <span class="inline-block h-px w-10 bg-white/10" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>
