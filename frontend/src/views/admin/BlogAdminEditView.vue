<template>
  <section class="admin-edit">
    <header class="admin-edit__header">
      <div>
        <p class="admin-edit__eyebrow">Admin · Blog</p>
        <h1 class="admin-edit__title">
          {{ mode === "create" ? "Create post" : "Edit post" }}
        </h1>
      </div>
      <RouterLink class="admin-edit__back" :to="{ name: 'admin-blog-list' }">
        Back to list
      </RouterLink>
    </header>

    <div v-if="state.loading" class="admin-edit__status" role="status">
      Loading post…
    </div>

    <form v-else class="admin-edit__form" @submit.prevent="handleSubmit">
      <div class="admin-edit__field">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="Post title"
        />
      </div>

      <div class="admin-edit__field">
        <label for="publishedAt">Published at</label>
        <input
          id="publishedAt"
          v-model="form.publishedAt"
          type="datetime-local"
          placeholder="2025-02-01T00:00"
        />
        <p class="admin-edit__hint">
          Leave blank to use the current time.
        </p>
      </div>

      <div class="admin-edit__field">
        <label for="body">Body</label>
        <textarea
          id="body"
          v-model="form.body"
          rows="12"
          required
          placeholder="Write your post contents here..."
        ></textarea>
      </div>

      <section class="admin-edit__preview" aria-live="polite">
        <header class="admin-edit__preview-header">
          <p class="admin-edit__preview-eyebrow">Live preview</p>
          <h2 class="admin-edit__preview-title">{{ previewTitle }}</h2>
          <div class="admin-edit__preview-meta">
            <span>{{ previewPublishedLabel }}</span>
            <span v-if="previewReadingTime">{{ previewReadingTime }}</span>
          </div>
        </header>
        <div v-if="previewBlocks.length === 0" class="admin-edit__preview-empty">
          Start writing to see the formatted article preview.
        </div>
        <div v-else class="admin-edit__preview-body">
          <template v-for="(block, index) in previewBlocks" :key="`${block.type}-${index}`">
            <h3
              v-if="block.type === 'heading' && block.level <= 2"
              class="admin-edit__preview-heading admin-edit__preview-heading--level-2"
            >
              {{ block.text }}
            </h3>
            <h4
              v-else-if="block.type === 'heading' && block.level >= 3"
              class="admin-edit__preview-heading admin-edit__preview-heading--level-3"
            >
              {{ block.text }}
            </h4>
            <blockquote
              v-else-if="block.type === 'quote'"
              class="admin-edit__preview-quote"
            >
              {{ block.text }}
            </blockquote>
            <ul v-else-if="block.type === 'list'" class="admin-edit__preview-list">
              <li v-for="(item, itemIndex) in block.items" :key="itemIndex">{{ item }}</li>
            </ul>
            <p v-else class="admin-edit__preview-paragraph">{{ block.text }}</p>
          </template>
        </div>
      </section>

      <div class="admin-edit__footer">
        <button
          type="submit"
          class="admin-edit__submit"
          :disabled="state.submitting"
        >
          {{ state.submitting ? "Saving…" : "Save post" }}
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="admin-edit__delete"
          :disabled="state.submitting"
          @click="handleDelete"
        >
          Delete
        </button>
      </div>

      <p v-if="state.error" class="admin-edit__error" role="alert">
        {{ state.error }}
      </p>
      <p v-if="state.success" class="admin-edit__success" role="status">
        Saved!
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
  estimateReadingMinutes,
  formatPublishedDate,
  parseBlogBody,
} from "../../lib/blog";
import type { BlogBodyBlock } from "../../lib/blog";
import { API_BASE_URL } from "../../lib/env";

type Mode = "create" | "edit";

const props = withDefaults(
  defineProps<{
    mode: Mode;
    id?: string;
  }>(),
  {
    mode: "create",
  },
);

const router = useRouter();

const emptyForm = () => ({
  blog: "",
  title: "",
  body: "",
  publishedAt: "",
});

const form = reactive(emptyForm());

const state = reactive({
  loading: props.mode === "edit",
  submitting: false,
  error: "" as string | null,
  success: false,
});

const canDelete = computed(() => props.mode === "edit" && Boolean(props.id));

const loadPost = async (postId: string) => {
  state.loading = true;
  state.error = null;
  state.success = false;
  try {
    const response = await fetch(
      `${API_BASE_URL}/blogs/${encodeURIComponent(postId)}`,
    );
    if (response.status === 404) {
      throw new Error("Post not found.");
    }
    if (!response.ok) {
      throw new Error(`Unable to load post (${response.status})`);
    }
    const payload = await response.json();
    form.blog = payload.blog;
    form.title = payload.title;
    form.body = payload.body;
    form.publishedAt = payload.publishedAt
      ? toLocalInputValue(payload.publishedAt)
      : "";
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong loading the post.";
    state.error = message;
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  if (props.mode === "edit" && props.id) {
    void loadPost(props.id);
  }
});

watch(
  () => props.mode,
  (mode) => {
    state.error = null;
    state.success = false;
    if (mode === "create") {
      Object.assign(form, emptyForm());
      state.loading = false;
    }
  },
);

watch(
  () => props.id,
  (nextId) => {
    if (props.mode === "edit" && nextId) {
      void loadPost(nextId as string);
    }
  },
);

const handleSubmit = async () => {
  state.submitting = true;
  state.error = null;
  state.success = false;

  const payload: Record<string, unknown> = {
    title: form.title,
    body: form.body,
  };

  const resolvedPublishedAt = form.publishedAt
    ? new Date(form.publishedAt).toISOString()
    : new Date().toISOString();
  payload.publishedAt = resolvedPublishedAt;

  try {
    if (props.mode === "create") {
      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Unable to create post (${response.status})`);
      }
      const created = await response.json();
      state.success = true;
      await router.replace({
        name: "admin-blog-edit",
        params: { id: created.blog },
      });
    } else {
      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blog: props.id,
          ...payload,
        }),
      });
      if (!response.ok) {
        throw new Error(`Unable to update post (${response.status})`);
      }
      state.success = true;
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong saving the post.";
    state.error = message;
  } finally {
    state.submitting = false;
  }
};

const handleDelete = async () => {
  if (!props.id) {
    return;
  }
  const proceed = window.confirm("Delete this blog post? This action cannot be undone.");
  if (!proceed) {
    return;
  }

  state.submitting = true;
  state.error = null;
  try {
    const response = await fetch(
      `${API_BASE_URL}/blogs/${encodeURIComponent(props.id)}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to delete post (${response.status})`);
    }
    await router.replace({ name: "admin-blog-list" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong deleting the post.";
    state.error = message;
  } finally {
    state.submitting = false;
  }
};

const toLocalInputValue = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (value: number) => `${value}`.padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const previewBlocks = computed<BlogBodyBlock[]>(() => parseBlogBody(form.body));

const previewTitle = computed(() => (form.title.trim() ? form.title.trim() : "Untitled post"));

const previewPublishedLabel = computed(() => {
  if (!form.publishedAt) {
    return "Draft";
  }
  const parsed = new Date(form.publishedAt);
  if (Number.isNaN(parsed.getTime())) {
    return form.publishedAt;
  }
  return formatPublishedDate(parsed.toISOString());
});

const previewReadingTime = computed(() => {
  const minutes = estimateReadingMinutes(form.body);
  return minutes ? `${minutes} min read` : "";
});
</script>
</script>

<style scoped>
.admin-edit__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.admin-edit__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.4rem;
  font-size: 0.75rem;
  opacity: 0.6;
  margin-bottom: 0.5rem;
}

.admin-edit__title {
  margin: 0;
  font-size: 2.25rem;
}

.admin-edit__back {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.15);
  color: inherit;
  text-decoration: none;
  font-size: 0.75rem;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
}

.admin-edit__status {
  letter-spacing: 0.08rem;
  opacity: 0.7;
}

.admin-edit__form {
  display: grid;
  gap: 1.5rem;
}

.admin-edit__field {
  display: grid;
  gap: 0.75rem;
}

.admin-edit__field label {
  font-size: 0.85rem;
  letter-spacing: 0.16rem;
  text-transform: uppercase;
  opacity: 0.7;
}

.admin-edit__field input,
.admin-edit__field textarea {
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.6);
  color: inherit;
  padding: 0.9rem 1.1rem;
  font: inherit;
  letter-spacing: 0.02rem;
}

.admin-edit__field textarea {
  resize: vertical;
}

.admin-edit__field input:focus,
.admin-edit__field textarea:focus {
  outline: none;
  border-color: rgba(56, 189, 248, 0.55);
}

.admin-edit__hint {
  font-size: 0.75rem;
  opacity: 0.55;
}

.admin-edit__preview {
  border-radius: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.5);
  padding: 1.85rem;
  display: grid;
  gap: 1.25rem;
}

.admin-edit__preview-header {
  display: grid;
  gap: 0.6rem;
}

.admin-edit__preview-eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.35rem;
  font-size: 0.65rem;
  opacity: 0.55;
}

.admin-edit__preview-title {
  margin: 0;
  font-size: 1.4rem;
  letter-spacing: 0.1rem;
  text-transform: uppercase;
}

.admin-edit__preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  font-size: 0.7rem;
  letter-spacing: 0.18rem;
  text-transform: uppercase;
  opacity: 0.6;
}

.admin-edit__preview-empty {
  font-size: 0.85rem;
  letter-spacing: 0.05rem;
  opacity: 0.7;
}

.admin-edit__preview-body {
  display: grid;
  gap: 1.1rem;
  font-size: 0.95rem;
  line-height: 1.7;
  opacity: 0.85;
}

.admin-edit__preview-paragraph {
  margin: 0;
}

.admin-edit__preview-heading {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.25rem;
}

.admin-edit__preview-heading--level-2 {
  font-size: 1.05rem;
}

.admin-edit__preview-heading--level-3 {
  font-size: 0.9rem;
  opacity: 0.75;
}

.admin-edit__preview-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.55rem;
}

.admin-edit__preview-list li {
  position: relative;
  padding-left: 1.35rem;
}

.admin-edit__preview-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  top: 0;
  color: rgba(148, 163, 184, 0.6);
}

.admin-edit__preview-quote {
  margin: 0;
  padding-left: 1rem;
  border-left: 3px solid rgba(148, 163, 184, 0.35);
  font-style: italic;
  opacity: 0.75;
}

.admin-edit__footer {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.admin-edit__submit,
.admin-edit__delete {
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  border: none;
  cursor: pointer;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.admin-edit__submit {
  background: rgba(56, 189, 248, 0.35);
  color: #f8fafc;
}

.admin-edit__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-edit__delete {
  background: rgba(248, 113, 113, 0.15);
  color: #fecaca;
}

.admin-edit__error {
  color: #f87171;
  margin: 0;
}

.admin-edit__success {
  color: #34d399;
  margin: 0;
}

@media (max-width: 640px) {
  .admin-edit__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-edit__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-edit__submit,
  .admin-edit__delete {
    width: 100%;
    text-align: center;
  }
}
</style>
