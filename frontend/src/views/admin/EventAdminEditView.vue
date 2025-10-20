<template>
  <section class="admin-event-edit">
    <header class="admin-event-edit__header">
      <div>
        <p class="admin-event-edit__eyebrow">Admin · Events</p>
        <h1 class="admin-event-edit__title">
          {{ mode === "create" ? "Create event" : "Edit event" }}
        </h1>
      </div>
      <RouterLink class="admin-event-edit__back" :to="{ name: 'admin-event-list' }">
        Back to list
      </RouterLink>
    </header>

    <div v-if="state.loading" class="admin-event-edit__status" role="status">
      Loading event…
    </div>

    <form v-else class="admin-event-edit__form" @submit.prevent="handleSubmit">
      <div class="admin-event-edit__field">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="Conference name"
        />
      </div>

      <div class="admin-event-edit__field-group">
        <div class="admin-event-edit__field">
          <label for="startAt">Starts</label>
          <input
            id="startAt"
            v-model="form.startAt"
            type="datetime-local"
            required
            placeholder="2025-05-12T18:30"
          />
        </div>
        <div class="admin-event-edit__field">
          <label for="endAt">Ends</label>
          <input
            id="endAt"
            v-model="form.endAt"
            type="datetime-local"
            placeholder="2025-05-12T20:30"
          />
          <p class="admin-event-edit__hint">
            Leave blank if this is a single moment event.
          </p>
        </div>
      </div>

      <div class="admin-event-edit__field">
        <label for="location">Location</label>
        <input
          id="location"
          v-model="form.location"
          type="text"
          placeholder="Venue, city, or virtual link"
        />
      </div>

      <div class="admin-event-edit__field">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="8"
          required
          placeholder="Describe the event details, speakers, and agenda…"
        ></textarea>
      </div>

      <section class="admin-event-edit__preview" aria-live="polite">
        <header class="admin-event-edit__preview-header">
          <p class="admin-event-edit__preview-eyebrow">Preview</p>
          <h2 class="admin-event-edit__preview-title">{{ previewTitle }}</h2>
          <div class="admin-event-edit__preview-meta">
            <span>{{ previewDateRange }}</span>
            <span v-if="previewLocation">{{ previewLocation }}</span>
          </div>
        </header>
        <p v-if="!form.description.trim()" class="admin-event-edit__preview-empty">
          Add a description to preview how it will appear.
        </p>
        <p v-else class="admin-event-edit__preview-body">
          {{ form.description }}
        </p>
      </section>

      <div class="admin-event-edit__footer">
        <button
          type="submit"
          class="admin-event-edit__submit"
          :disabled="state.submitting"
        >
          {{ state.submitting ? "Saving…" : "Save event" }}
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="admin-event-edit__delete"
          :disabled="state.submitting"
          @click="handleDelete"
        >
          Delete
        </button>
      </div>

      <p v-if="state.error" class="admin-event-edit__error" role="alert">
        {{ state.error }}
      </p>
      <p v-if="state.success" class="admin-event-edit__success" role="status">
        Saved!
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
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
  event: "",
  title: "",
  description: "",
  location: "",
  startAt: "",
  endAt: "",
  createdAt: "",
});

const form = reactive(emptyForm());

const state = reactive({
  loading: props.mode === "edit",
  submitting: false,
  error: null as string | null,
  success: false,
});

const canDelete = computed(() => props.mode === "edit" && Boolean(props.id));

const loadEvent = async (eventId: string) => {
  state.loading = true;
  state.error = null;
  state.success = false;
  try {
    const response = await fetch(
      `${API_BASE_URL}/events/${encodeURIComponent(eventId)}`,
    );
    if (response.status === 404) {
      throw new Error("Event not found.");
    }
    if (!response.ok) {
      throw new Error(`Unable to load event (${response.status})`);
    }
    const payload = await response.json();
    form.event = payload.event;
    form.title = payload.title ?? "";
    form.description = payload.description ?? "";
    form.location = payload.location ?? "";
    form.createdAt = payload.createdAt ?? "";
    form.startAt = payload.startAt ? toLocalInputValue(payload.startAt) : "";
    form.endAt = payload.endAt ? toLocalInputValue(payload.endAt) : "";
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong loading the event.";
    state.error = message;
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  if (props.mode === "edit" && props.id) {
    void loadEvent(props.id);
  } else {
    state.loading = false;
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
      void loadEvent(nextId as string);
    }
  },
);

const handleSubmit = async () => {
  state.submitting = true;
  state.error = null;
  state.success = false;

  const payload: Record<string, unknown> = {
    title: form.title,
    description: form.description,
  };

  const resolvedStartAt = normalizeDateTime(form.startAt);
  if (!resolvedStartAt) {
    state.error = "Start time must be a valid date.";
    state.submitting = false;
    return;
  }
  payload.startAt = resolvedStartAt;

  const resolvedEndAt = normalizeDateTime(form.endAt);
  if (form.endAt && !resolvedEndAt) {
    state.error = "End time must be a valid date.";
    state.submitting = false;
    return;
  } else if (resolvedEndAt) {
    payload.endAt = resolvedEndAt;
  } else if (!form.endAt && props.mode === "edit") {
    payload.endAt = "";
  }

  const locationValue = form.location.trim();
  if (locationValue || props.mode === "edit") {
    payload.location = locationValue;
  }

  try {
    if (props.mode === "create") {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Unable to create event (${response.status})`);
      }
      const created = await response.json();
      state.success = true;
      await router.replace({
        name: "admin-event-edit",
        params: { id: created.event },
      });
    } else {
      if (!form.createdAt) {
        throw new Error("Missing event metadata. Reload and try again.");
      }
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: props.id,
          createdAt: form.createdAt,
          ...payload,
        }),
      });
      if (!response.ok) {
        throw new Error(`Unable to update event (${response.status})`);
      }
      state.success = true;
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong saving the event.";
    state.error = message;
  } finally {
    state.submitting = false;
  }
};

const handleDelete = async () => {
  if (!props.id) {
    return;
  }
  const proceed = window.confirm("Delete this event? This action cannot be undone.");
  if (!proceed) {
    return;
  }

  state.submitting = true;
  state.error = null;
  try {
    const response = await fetch(
      `${API_BASE_URL}/events/${encodeURIComponent(props.id)}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to delete event (${response.status})`);
    }
    await router.replace({ name: "admin-event-list" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong deleting the event.";
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

const normalizeDateTime = (input: string) => {
  if (!input) {
    return "";
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
};

const previewTitle = computed(() =>
  form.title.trim() ? form.title.trim() : "Untitled event",
);

const previewLocation = computed(() => form.location.trim());

const previewDateRange = computed(() => {
  const start = normalizeDateTime(form.startAt);
  if (!start) {
    return "Start time TBD";
  }
  const formattedStart = formatDateDisplay(start);
  const end = normalizeDateTime(form.endAt);
  if (!end) {
    return formattedStart;
  }
  const formattedEnd = formatDateDisplay(end);
  return `${formattedStart} → ${formattedEnd}`;
});

const formatDateDisplay = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(Date.parse(iso));
</script>

<style scoped>
.admin-event-edit__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.admin-event-edit__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.4rem;
  font-size: 0.75rem;
  opacity: 0.6;
  margin-bottom: 0.5rem;
}

.admin-event-edit__title {
  margin: 0;
  font-size: 2.25rem;
}

.admin-event-edit__back {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.15);
  color: inherit;
  text-decoration: none;
  font-size: 0.75rem;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
}

.admin-event-edit__status {
  letter-spacing: 0.08rem;
  opacity: 0.7;
}

.admin-event-edit__form {
  display: grid;
  gap: 1.5rem;
}

.admin-event-edit__field {
  display: grid;
  gap: 0.75rem;
}

.admin-event-edit__field-group {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.admin-event-edit__field label {
  font-size: 0.85rem;
  letter-spacing: 0.16rem;
  text-transform: uppercase;
  opacity: 0.7;
}

.admin-event-edit__field input,
.admin-event-edit__field textarea {
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.6);
  color: inherit;
  padding: 0.9rem 1.1rem;
  font: inherit;
  letter-spacing: 0.02rem;
}

.admin-event-edit__field textarea {
  resize: vertical;
}

.admin-event-edit__field input:focus,
.admin-event-edit__field textarea:focus {
  outline: none;
  border-color: rgba(134, 239, 172, 0.55);
}

.admin-event-edit__hint {
  font-size: 0.75rem;
  opacity: 0.55;
}

.admin-event-edit__preview {
  border-radius: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.5);
  padding: 1.85rem;
  display: grid;
  gap: 1.25rem;
}

.admin-event-edit__preview-header {
  display: grid;
  gap: 0.6rem;
}

.admin-event-edit__preview-eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.35rem;
  font-size: 0.65rem;
  opacity: 0.55;
}

.admin-event-edit__preview-title {
  margin: 0;
  font-size: 1.4rem;
  letter-spacing: 0.1rem;
  text-transform: uppercase;
}

.admin-event-edit__preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  font-size: 0.7rem;
  letter-spacing: 0.18rem;
  text-transform: uppercase;
  opacity: 0.6;
}

.admin-event-edit__preview-empty {
  font-size: 0.85rem;
  letter-spacing: 0.05rem;
  opacity: 0.7;
}

.admin-event-edit__preview-body {
  font-size: 0.95rem;
  line-height: 1.7;
  opacity: 0.85;
  margin: 0;
}

.admin-event-edit__footer {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.admin-event-edit__submit,
.admin-event-edit__delete {
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  border: none;
  cursor: pointer;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.admin-event-edit__submit {
  background: rgba(134, 239, 172, 0.3);
  color: #f8fafc;
}

.admin-event-edit__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-event-edit__delete {
  background: rgba(248, 113, 113, 0.15);
  color: #fecaca;
}

.admin-event-edit__error {
  color: #f87171;
  margin: 0;
}

.admin-event-edit__success {
  color: #34d399;
  margin: 0;
}

@media (max-width: 640px) {
  .admin-event-edit__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-event-edit__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-event-edit__submit,
  .admin-event-edit__delete {
    width: 100%;
    text-align: center;
  }
}
</style>
