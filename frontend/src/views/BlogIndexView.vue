<template>
  <div class="blog-layout">
    <header class="blog-header">
      <RouterLink class="blog-header__logo" to="/">LENA CLAV</RouterLink>
      <nav aria-label="Blog navigation">
        <RouterLink class="blog-header__link" to="/blog">Latest posts</RouterLink>
      </nav>
    </header>

    <main class="blog-main">
      <section class="blog-hero">
        <p class="blog-hero__eyebrow">Blog</p>
        <h1 class="blog-hero__title">Latest Posts</h1>
        <p class="blog-hero__subtitle">
          Stories, updates, and notes from the studio.
        </p>
      </section>

      <section class="blog-search" role="search">
        <label class="blog-search__label" for="blog-search-input">Search posts</label>
        <input
          id="blog-search-input"
          v-model="searchTerm"
          type="search"
          placeholder="Search by title or body"
          class="blog-search__input"
        />
        <p
          v-if="!state.loading && !state.error"
          class="blog-search__summary"
          aria-live="polite"
        >
          {{ resultsSummary }}
        </p>
      </section>

      <div v-if="state.loading" class="blog-loading" role="status" aria-live="polite">
        <p class="blog-status">Loading posts…</p>
        <ul class="blog-list blog-list--skeleton" aria-hidden="true">
          <li v-for="index in 3" :key="`skeleton-${index}`" class="blog-list__item">
            <div class="blog-card blog-card--skeleton">
              <span class="skeleton-line skeleton-line--date"></span>
              <span class="skeleton-line skeleton-line--title"></span>
              <span class="skeleton-line skeleton-line--excerpt"></span>
              <span class="skeleton-line skeleton-line--excerpt skeleton-line--short"></span>
            </div>
          </li>
        </ul>
      </div>
      <div v-else-if="state.error" class="blog-status blog-status--error" role="alert">
        <p>{{ state.error }}</p>
        <button type="button" class="blog-status__retry" @click="void fetchPosts()">
          Retry
        </button>
      </div>
      <ul v-else class="blog-list" aria-live="polite">
        <li v-if="filteredPosts.length === 0" class="blog-list__empty">
          <template v-if="hasActiveSearch">
            No posts match “{{ searchTermDisplay }}”.
          </template>
          <template v-else>
            No posts yet—check back soon.
          </template>
        </li>
        <template v-else>
          <li v-for="post in filteredPosts" :key="post.blog" class="blog-list__item">
            <RouterLink
              class="blog-card"
              :to="{ name: 'blog-show', params: { id: post.blog } }"
            >
              <time class="blog-card__date" :datetime="post.publishedAt ?? undefined">
                {{ formatPublished(post.publishedAt) }}
              </time>
              <h2 class="blog-card__title">{{ post.title }}</h2>
              <p class="blog-card__excerpt">{{ buildExcerpt(post.body) }}</p>
            </RouterLink>
          </li>
        </template>
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { buildExcerpt, formatPublishedDate } from "../lib/blog";
import { API_BASE_URL } from "../lib/env";

type BlogListItem = {
  blog: string;
  title: string;
  body: string;
  publishedAt?: string;
};

type BlogListResponse = {
  data?: BlogListItem[];
};

const state = reactive({
  loading: true,
  error: null as string | null,
  posts: [] as BlogListItem[],
});

const searchTerm = ref("");

const fetchPosts = async () => {
  state.loading = true;
  state.error = null;
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`);
    if (!response.ok) {
      throw new Error(`Unable to fetch posts (${response.status})`);
    }

    const payload = (await response.json()) as BlogListResponse;
    state.posts = payload.data ?? [];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong loading posts.";
    state.error = message;
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  void fetchPosts();
});

const sortedPosts = computed(() =>
  [...state.posts].sort((a, b) => {
    const left = Date.parse(b.publishedAt ?? "");
    const right = Date.parse(a.publishedAt ?? "");
    const safeLeft = Number.isNaN(left) ? 0 : left;
    const safeRight = Number.isNaN(right) ? 0 : right;
    return safeLeft - safeRight;
  }),
);

const trimmedSearch = computed(() => searchTerm.value.trim());
const normalizedSearch = computed(() => trimmedSearch.value.toLowerCase());
const hasActiveSearch = computed(() => normalizedSearch.value.length > 0);

const filteredPosts = computed(() => {
  if (!hasActiveSearch.value) {
    return sortedPosts.value;
  }
  const needle = normalizedSearch.value;
  return sortedPosts.value.filter((post) => {
    const haystack = `${post.title} ${post.body}`.toLowerCase();
    return haystack.includes(needle);
  });
});

const searchTermDisplay = computed(() => trimmedSearch.value);

const resultsSummary = computed(() => {
  const count = filteredPosts.value.length;
  const noun = count === 1 ? "post" : "posts";
  if (hasActiveSearch.value) {
    const label = searchTermDisplay.value;
    return count === 0
      ? `No ${noun} match "${label}"`
      : `${count} ${noun} match "${label}"`;
  }
  return `${count} ${noun} available`;
});

const formatPublished = formatPublishedDate;
</script>

<style scoped>
.blog-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #020617;
  color: #e2e8f0;
}

.blog-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  z-index: 10;
}

.blog-header__logo {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.55rem;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
}

.blog-header__link {
  font-size: 0.85rem;
  letter-spacing: 0.22rem;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
  opacity: 0.72;
}

.blog-header__link:hover {
  opacity: 1;
}

.blog-main {
  width: min(980px, 100%);
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  flex: 1;
}

.blog-hero__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.55rem;
  font-size: 0.75rem;
  opacity: 0.6;
  margin-bottom: 0.75rem;
}

.blog-hero__title {
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4rem);
  letter-spacing: -0.02em;
}

.blog-hero__subtitle {
  margin: 0.85rem 0 2.5rem;
  max-width: 36rem;
  font-size: 1.05rem;
  opacity: 0.65;
}

.blog-search {
  display: grid;
  gap: 0.75rem;
  margin: 2.5rem 0 2rem;
}

.blog-search__label {
  text-transform: uppercase;
  letter-spacing: 0.35rem;
  font-size: 0.7rem;
  opacity: 0.6;
}

.blog-search__input {
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.6);
  color: inherit;
  padding: 0.85rem 1.25rem;
  font: inherit;
  letter-spacing: 0.05rem;
}

.blog-search__input::placeholder {
  color: rgba(148, 163, 184, 0.6);
}

.blog-search__input:focus {
  outline: none;
  border-color: rgba(56, 189, 248, 0.55);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.blog-search__summary {
  font-size: 0.7rem;
  letter-spacing: 0.24rem;
  text-transform: uppercase;
  opacity: 0.6;
}

.blog-loading {
  display: grid;
  gap: 1.5rem;
}

.blog-status {
  margin-top: 1rem;
  font-size: 1rem;
  letter-spacing: 0.08rem;
  opacity: 0.75;
}

.blog-status--error {
  color: #f87171;
}

.blog-status__retry {
  margin-top: 1rem;
  border: 1px solid rgba(248, 113, 113, 0.7);
  background: rgba(248, 113, 113, 0.1);
  color: #fecaca;
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.18rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;
}

.blog-status__retry:hover {
  background: rgba(248, 113, 113, 0.2);
  transform: translateY(-1px);
}

.blog-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1.75rem;
}

.blog-list--skeleton .blog-card {
  pointer-events: none;
}

.blog-list__empty {
  border: 1px dashed rgba(148, 163, 184, 0.4);
  border-radius: 1rem;
  padding: 2.5rem;
  text-align: center;
  opacity: 0.7;
}

.blog-card {
  display: block;
  padding: 1.75rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: inherit;
  text-decoration: none;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.blog-card:hover {
  transform: translate3d(0, -4px, 0);
  border-color: rgba(148, 163, 184, 0.55);
  background: rgba(15, 23, 42, 0.75);
}

.blog-card__date {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.28rem;
  text-transform: uppercase;
  opacity: 0.55;
  margin-bottom: 0.75rem;
}

.blog-card__title {
  margin: 0 0 1rem;
  font-size: 1.55rem;
  letter-spacing: 0.08rem;
  text-transform: uppercase;
}

.blog-card__excerpt {
  margin: 0;
  line-height: 1.65;
  opacity: 0.7;
}

.blog-card--skeleton {
  display: grid;
  gap: 0.75rem;
  padding: 1.75rem 2rem;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 1.5rem;
  background: rgba(15, 23, 42, 0.5);
}

.skeleton-line {
  display: block;
  height: 0.85rem;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.2),
    rgba(148, 163, 184, 0.4),
    rgba(148, 163, 184, 0.2)
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

.skeleton-line--date {
  width: 40%;
  height: 0.65rem;
}

.skeleton-line--title {
  width: 80%;
  height: 1.1rem;
}

.skeleton-line--excerpt {
  width: 100%;
}

.skeleton-line--short {
  width: 65%;
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 640px) {
  .blog-header {
    padding-inline: 1rem;
  }

  .blog-header__logo {
    letter-spacing: 0.35rem;
  }

  .blog-main {
    padding-inline: 1rem;
  }

  .blog-card {
    padding: 1.5rem;
  }
}
</style>
