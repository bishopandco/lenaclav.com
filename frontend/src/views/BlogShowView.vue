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
          <span v-if="readingTimeLabel" class="post-article__reading">{{ readingTimeLabel }}</span>
        </div>

        <div class="post-article__actions" aria-live="polite">
          <button
            type="button"
            class="post-article__action"
            :disabled="copyFeedback === 'copied'"
            @click="copyLink"
          >
            {{ copyButtonText }}
          </button>
          <button
            v-if="canShare"
            type="button"
            class="post-article__action post-article__action--secondary"
            @click="sharePost"
          >
            Share
          </button>
          <p v-if="copyFeedbackMessage" class="post-article__feedback" role="status">
            {{ copyFeedbackMessage }}
          </p>
          <p v-if="shareError" class="post-article__feedback post-article__feedback--error" role="alert">
            {{ shareError }}
          </p>
        </div>

        <div class="post-article__body">
          <template v-for="(block, index) in contentBlocks" :key="`${block.type}-${index}`">
            <h2
              v-if="block.type === 'heading' && block.level <= 2"
              class="post-article__heading post-article__heading--level-2"
            >
              {{ block.text }}
            </h2>
            <h3
              v-else-if="block.type === 'heading' && block.level >= 3"
              class="post-article__heading post-article__heading--level-3"
            >
              {{ block.text }}
            </h3>
            <blockquote v-else-if="block.type === 'quote'" class="post-article__quote">
              {{ block.text }}
            </blockquote>
            <ul v-else-if="block.type === 'list'" class="post-article__list">
              <li v-for="(item, itemIndex) in block.items" :key="itemIndex">{{ item }}</li>
            </ul>
            <p v-else class="post-article__paragraph">
              {{ block.text }}
            </p>
          </template>
        </div>
      </article>
      <div v-else class="post-status" role="alert">
        We couldn't find this post.
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import {
  buildExcerpt,
  estimateReadingMinutes,
  formatPublishedDate,
  parseBlogBody,
} from "../lib/blog";
import type { BlogBodyBlock } from "../lib/blog";
import { API_BASE_URL } from "../lib/env";

type BlogResponse = {
  blog: string;
  title: string;
  body: string;
  publishedAt?: string;
};

const props = defineProps<{
  id: string;
}>();

const state = reactive<{
  loading: boolean;
  error: string | null;
  post: BlogResponse | null;
}>({
  loading: true,
  error: null,
  post: null,
});

const copyFeedback = ref<"idle" | "copied" | "error">("idle");
const shareError = ref<string | null>(null);
let copyReset: ReturnType<typeof setTimeout> | null = null;

const fetchPost = async (postId: string) => {
  state.loading = true;
  state.error = null;
  state.post = null;
  try {
    const response = await fetch(
      `${API_BASE_URL}/blogs/${encodeURIComponent(postId)}`,
    );
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
  void fetchPost(props.id);
});

watch(
  () => props.id,
  (nextId) => {
    void fetchPost(nextId);
  },
);

const contentBlocks = computed<BlogBodyBlock[]>(() => {
  if (!state.post) {
    return [];
  }
  return parseBlogBody(state.post.body);
});

const readingMinutes = computed(() =>
  state.post ? estimateReadingMinutes(state.post.body) : 0,
);
const readingTimeLabel = computed(() => (readingMinutes.value ? `${readingMinutes.value} min read` : ""));

const shareSummary = computed(() => (state.post ? buildExcerpt(state.post.body) : ""));

const canShare = computed(
  () => typeof navigator !== "undefined" && typeof navigator.share === "function",
);

const resolvePostUrl = () => {
  if (typeof window === "undefined" || !state.post) {
    return null;
  }
  return `${window.location.origin}/blog/${state.post.blog}`;
};

const copyButtonText = computed(() =>
  copyFeedback.value === "copied" ? "Link copied" : "Copy link",
);

const copyFeedbackMessage = computed(() => {
  if (copyFeedback.value === "copied") {
    return "Link copied to clipboard";
  }
  if (copyFeedback.value === "error") {
    return "Copy failed. Try again or use share.";
  }
  return "";
});

const copyLink = async () => {
  const url = resolvePostUrl();
  if (!url) {
    return;
  }

  if (copyReset) {
    clearTimeout(copyReset);
    copyReset = null;
  }

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      copyFeedback.value = "copied";
    } else {
      throw new Error("Clipboard unavailable");
    }
  } catch (error) {
    copyFeedback.value = "error";
    if (typeof window !== "undefined" && typeof window.prompt === "function") {
      window.prompt("Copy this link", url);
    }
  }

  copyReset = setTimeout(() => {
    copyFeedback.value = "idle";
    copyReset = null;
  }, 2400);
};

const sharePost = async () => {
  const url = resolvePostUrl();
  if (!url || !state.post) {
    return;
  }

  if (!canShare.value) {
    await copyLink();
    return;
  }

  try {
    shareError.value = null;
    const typedNavigator = navigator as Navigator & { share: (data: ShareData) => Promise<void> };
    await typedNavigator.share({
      title: state.post.title,
      text: shareSummary.value,
      url,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }
    shareError.value =
      error instanceof Error
        ? error.message
        : "Unable to open the native share dialog. Copy the link instead.";
  }
};

const formatPublished = formatPublishedDate;

onBeforeUnmount(() => {
  if (copyReset) {
    clearTimeout(copyReset);
    copyReset = null;
  }
});
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
  gap: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.24rem;
  font-size: 0.75rem;
  opacity: 0.6;
  margin-bottom: 2rem;
}

.post-article__id {
  font-family: "Fira Code", "Source Code Pro", ui-monospace, SFMono-Regular, Menlo,
    Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.post-article__reading {
  color: #cbd5f5;
}

.post-article__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.post-article__action {
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.6);
  color: inherit;
  padding: 0.6rem 1.3rem;
  text-transform: uppercase;
  letter-spacing: 0.22rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: background 160ms ease, transform 160ms ease, border-color 160ms ease;
}

.post-article__action:hover:enabled {
  background: rgba(56, 189, 248, 0.18);
  border-color: rgba(56, 189, 248, 0.45);
  transform: translateY(-1px);
}

.post-article__action:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.post-article__action--secondary {
  border-color: rgba(148, 163, 184, 0.25);
  background: rgba(148, 163, 184, 0.12);
}

.post-article__feedback {
  font-size: 0.75rem;
  letter-spacing: 0.18rem;
  text-transform: uppercase;
  opacity: 0.7;
}

.post-article__feedback--error {
  color: #f87171;
}

.post-article__body {
  font-size: 1.1rem;
  line-height: 1.85;
  letter-spacing: 0.02rem;
  display: grid;
  gap: 1.7rem;
  opacity: 0.9;
}

.post-article__paragraph {
  margin: 0;
}

.post-article__heading {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.32rem;
}

.post-article__heading--level-2 {
  font-size: 1.35rem;
}

.post-article__heading--level-3 {
  font-size: 1.1rem;
  letter-spacing: 0.26rem;
  opacity: 0.8;
}

.post-article__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.post-article__list li {
  position: relative;
  padding-left: 1.5rem;
}

.post-article__list li::before {
  content: "•";
  position: absolute;
  left: 0;
  top: 0;
  color: rgba(148, 163, 184, 0.6);
  font-size: 1.2em;
  line-height: 1;
}

.post-article__quote {
  margin: 0;
  padding-left: 1.2rem;
  border-left: 3px solid rgba(148, 163, 184, 0.45);
  font-style: italic;
  opacity: 0.8;
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

  .post-article__meta {
    gap: 0.85rem;
    letter-spacing: 0.18rem;
  }

  .post-article__actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-article__action {
    width: 100%;
    text-align: center;
  }
}
</style>
