<template>
  <section class="admin-blog">
    <header class="admin-blog__header">
      <div>
        <p class="admin-blog__eyebrow">Admin</p>
        <h1 class="admin-blog__title">Blog Posts</h1>
      </div>
      <RouterLink class="admin-blog__create" :to="{ name: 'admin-blog-new' }">
        New Post
      </RouterLink>
    </header>

    <div v-if="state.loading" class="admin-blog__status" role="status">
      Loading posts…
    </div>
    <div v-else-if="state.error" class="admin-blog__status admin-blog__status--error" role="alert">
      {{ state.error }}
    </div>
    <div v-else>
      <table v-if="state.posts.length" class="admin-blog__table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Published</th>
            <th scope="col" class="admin-blog__actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in sortedPosts" :key="post.blog">
            <td>
              <RouterLink
                class="admin-blog__link"
                :to="{ name: 'admin-blog-edit', params: { id: post.blog } }"
              >
                {{ post.title }}
              </RouterLink>
            </td>
            <td>
              <time :datetime="post.publishedAt ?? undefined">
                {{ formatPublished(post.publishedAt) }}
              </time>
            </td>
            <td class="admin-blog__actions">
              <RouterLink
                class="admin-blog__action"
                :to="{ name: 'admin-blog-edit', params: { id: post.blog } }"
              >
                Edit
              </RouterLink>
              <button
                type="button"
                class="admin-blog__action admin-blog__action--danger"
                @click="confirmDelete(post.blog)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="admin-blog__empty">
        No posts yet. Create one to get started.
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { RouterLink } from "vue-router";
import { formatPublishedDate } from "../../lib/blog";
import { apiFetch } from "../../lib/http";

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

const fetchPosts = async () => {
  state.loading = true;
  state.error = null;
  try {
    const response = await apiFetch("/blogs");
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

const formatPublished = formatPublishedDate;

const confirmDelete = async (blogId: string) => {
  const proceed = window.confirm("Delete this blog post? This action cannot be undone.");
  if (!proceed) {
    return;
  }

  try {
    const response = await apiFetch(`/blogs/${encodeURIComponent(blogId)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete post (${response.status})`);
    }
    state.posts = state.posts.filter((post) => post.blog !== blogId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong deleting the post.";
    state.error = message;
  }
};
</script>

<style scoped>
.admin-blog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.admin-blog__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.4rem;
  font-size: 0.75rem;
  opacity: 0.6;
  margin-bottom: 0.5rem;
}

.admin-blog__title {
  margin: 0;
  font-size: 2.25rem;
}

.admin-blog__create {
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #f8fafc;
  text-decoration: none;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  transition: background 150ms ease, transform 150ms ease;
}

.admin-blog__create:hover {
  background: rgba(56, 189, 248, 0.3);
  transform: translateY(-2px);
}

.admin-blog__status {
  font-size: 0.95rem;
  letter-spacing: 0.08rem;
  opacity: 0.7;
}

.admin-blog__status--error {
  color: #f87171;
}

.admin-blog__table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(15, 23, 42, 0.55);
  border-radius: 1rem;
  overflow: hidden;
}

.admin-blog__table th,
.admin-blog__table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  text-align: left;
}

.admin-blog__table th {
  font-size: 0.75rem;
  letter-spacing: 0.22rem;
  text-transform: uppercase;
  opacity: 0.6;
}

.admin-blog__table tbody tr:hover {
  background: rgba(15, 23, 42, 0.75);
}

.admin-blog__link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}

.admin-blog__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.admin-blog__action {
  background: none;
  border: none;
  color: #38bdf8;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.16rem;
  font-size: 0.7rem;
}

.admin-blog__action--danger {
  color: #f87171;
}

.admin-blog__empty {
  padding: 2.5rem;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  border-radius: 1rem;
  text-align: center;
  opacity: 0.7;
}

@media (max-width: 720px) {
  .admin-blog__table {
    display: block;
    overflow-x: auto;
  }
}
</style>
