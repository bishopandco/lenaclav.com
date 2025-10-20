<template>
  <div class="post-layout">
    <header class="post-header">
      <RouterLink class="post-header__logo" to="/">LENA CLAV</RouterLink>
      <nav aria-label="Post navigation">
        <RouterLink class="post-header__link" to="/blog">Back to posts</RouterLink>
      </nav>
    </header>

    <main class="post-main">
      <div v-if="state.loading" class="post-status" role="status">Loading…</div>
      <div v-else-if="state.error" class="post-status post-status--error" role="alert">
        {{ state.error }}
      </div>
      <article v-else-if="state.post" class="post-article">
        <p class="post-article__eyebrow">Blog</p>
        <h1 class="post-article__title">{{ state.post.title }}</h1>
        <div class="post-article__meta">
          <time :datetime="state.post.publishedAt ?? undefined">
            {{ formatPublished(state.post.publishedAt) }}
          </time>
          <span class="post-article__id">ID: {{ state.post.blog }}</span>
        </div>
        <div class="post-article__body">
          <p v-for="(paragraph, index) in paragraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>
      </article>
      <div v-else class="post-status" role="alert">
        We couldn't find this post.
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from "vue";
import { RouterLink } from "vue-router";

type BlogResponse = {
  blog: string;
  title: string;
  body: string;
  publishedAt?: string;
};

const props = defineProps<{
  id: string;
}>();

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const state = reactive<{
  loading: boolean;
  error: string | null;
  post: BlogResponse | null;
}>({
  loading: true,
  error: null,
  post: null,
});

const fetchPost = async (postId: string) => {
  state.loading = true;
  state.error = null;
  state.post = null;
  try {
    const response = await fetch(`${API_BASE}/blogs/${encodeURIComponent(postId)}`);
    if (response.status === 404) {
      state.post = null;
      state.loading = false;
      return;
    }
    if (!response.ok) {
      throw new Error(`Unable to load blog post (${response.status})`);
    }
    const payload = (await response.json()) as BlogResponse;
    state.post = payload;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong loading the post.";
    state.error = message;
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  fetchPost(props.id);
});

watch(
  () => props.id,
  (nextId) => {
    fetchPost(nextId);
  },
);

const paragraphs = computed(() => {
  if (!state.post) {
    return [];
  }
  return state.post.body
    .split(/\r?\n/)
    .map((para) => para.trim())
    .filter(Boolean);
});

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
</script>

<style scoped>
.post-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.08), transparent 55%),
    #020617;
  color: #e2e8f0;
}

.post-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: rgba(2, 6, 23, 0.88);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  z-index: 10;
}

.post-header__logo {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.55rem;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
}

.post-header__link {
  font-size: 0.85rem;
  letter-spacing: 0.22rem;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
  opacity: 0.72;
}

.post-header__link:hover {
  opacity: 1;
}

.post-main {
  width: min(820px, 100%);
  margin: 0 auto;
  padding: 3.5rem 1.5rem 5rem;
  flex: 1;
}

.post-status {
  margin-top: 3rem;
  font-size: 1rem;
  letter-spacing: 0.08rem;
  opacity: 0.75;
}

.post-status--error {
  color: #f87171;
}

.post-article__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.55rem;
  font-size: 0.78rem;
  opacity: 0.55;
  margin-bottom: 1rem;
}

.post-article__title {
  margin: 0 0 1.5rem;
  font-size: clamp(2.5rem, 5vw, 4.25rem);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.post-article__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.24rem;
  font-size: 0.75rem;
  opacity: 0.6;
  margin-bottom: 2.25rem;
}

.post-article__id {
  font-family: "Fira Code", "Source Code Pro", ui-monospace, SFMono-Regular, Menlo,
    Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.post-article__body {
  font-size: 1.1rem;
  line-height: 1.85;
  letter-spacing: 0.02rem;
  display: grid;
  gap: 1.5rem;
  opacity: 0.9;
}

@media (max-width: 640px) {
  .post-header {
    padding-inline: 1rem;
  }

  .post-header__logo {
    letter-spacing: 0.35rem;
  }

  .post-main {
    padding-inline: 1rem;
  }
}
</style>
