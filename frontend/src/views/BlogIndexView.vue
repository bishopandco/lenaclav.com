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

      <div v-if="state.loading" class="blog-status" role="status">
        Loading posts…
      </div>
      <div v-else-if="state.error" class="blog-status blog-status--error" role="alert">
        {{ state.error }}
      </div>
      <ul v-else class="blog-list" aria-live="polite">
        <li v-if="sortedPosts.length === 0" class="blog-list__empty">
          No posts yet—check back soon.
        </li>
        <li v-for="post in sortedPosts" :key="post.blog" class="blog-list__item">
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
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { RouterLink } from "vue-router";

type BlogListItem = {
  blog: string;
  title: string;
  body: string;
  publishedAt?: string;
};

type BlogListResponse = {
  data?: BlogListItem[];
};

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const state = reactive({
  loading: true,
  error: null as string | null,
  posts: [] as BlogListItem[],
});

const fetchPosts = async () => {
  state.loading = true;
  state.error = null;
  try {
    const response = await fetch(`${API_BASE}/blogs`);
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

onMounted(fetchPosts);

const sortedPosts = computed(() =>
  [...state.posts].sort((a, b) => {
    const left = Date.parse(b.publishedAt ?? "");
    const right = Date.parse(a.publishedAt ?? "");
    const safeLeft = Number.isNaN(left) ? 0 : left;
    const safeRight = Number.isNaN(right) ? 0 : right;
    return safeLeft - safeRight;
  }),
);

const formatPublished = (value?: string) => {
  if (!value) {
    return "Unpublished";
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(timestamp);
};

const buildExcerpt = (body: string) => {
  const stripped = body.replace(/\s+/g, " ").trim();
  if (stripped.length <= 160) {
    return stripped;
  }
  return `${stripped.slice(0, 157)}…`;
};
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

.blog-status {
  margin-top: 2rem;
  font-size: 1rem;
  letter-spacing: 0.08rem;
  opacity: 0.75;
}

.blog-status--error {
  color: #f87171;
}

.blog-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1.75rem;
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
