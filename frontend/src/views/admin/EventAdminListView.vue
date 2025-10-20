<template>
  <section class="admin-events">
    <header class="admin-events__header">
      <div>
        <p class="admin-events__eyebrow">Admin</p>
        <h1 class="admin-events__title">Events</h1>
      </div>
      <RouterLink class="admin-events__create" :to="{ name: 'admin-event-new' }">
        New Event
      </RouterLink>
    </header>

    <div v-if="state.loading" class="admin-events__status" role="status">
      Loading events…
    </div>
    <div
      v-else-if="state.error"
      class="admin-events__status admin-events__status--error"
      role="alert"
    >
      {{ state.error }}
    </div>
    <div v-else>
      <table v-if="state.events.length" class="admin-events__table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Start</th>
            <th scope="col">End</th>
            <th scope="col">Location</th>
            <th scope="col" class="admin-events__actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in sortedEvents" :key="event.event">
            <td>
              <RouterLink
                class="admin-events__link"
                :to="{ name: 'admin-event-edit', params: { id: event.event } }"
              >
                {{ event.title }}
              </RouterLink>
            </td>
            <td>
              <time :datetime="event.startAt ?? undefined">
                {{ formatDate(event.startAt) }}
              </time>
            </td>
            <td>
              <time :datetime="event.endAt ?? undefined">
                {{ formatDate(event.endAt) }}
              </time>
            </td>
            <td>
              {{ event.location || "—" }}
            </td>
            <td class="admin-events__actions">
              <RouterLink
                class="admin-events__action"
                :to="{ name: 'admin-event-edit', params: { id: event.event } }"
              >
                Edit
              </RouterLink>
              <button
                type="button"
                class="admin-events__action admin-events__action--danger"
                @click="confirmDelete(event.event)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="admin-events__empty">
        No events yet. Create one to get started.
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { RouterLink } from "vue-router";
import { API_BASE_URL } from "../../lib/env";

type EventListItem = {
  event: string;
  title: string;
  description: string;
  location?: string | null;
  startAt?: string | null;
  endAt?: string | null;
};

type EventListResponse = {
  data?: EventListItem[];
};

const state = reactive({
  loading: true,
  error: null as string | null,
  events: [] as EventListItem[],
});

const fetchEvents = async () => {
  state.loading = true;
  state.error = null;
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error(`Unable to fetch events (${response.status})`);
    }
    const payload = (await response.json()) as EventListResponse;
    state.events = payload.data ?? [];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong loading events.";
    state.error = message;
  } finally {
    state.loading = false;
  }
};

onMounted(fetchEvents);

const sortedEvents = computed(() =>
  [...state.events].sort((a, b) => {
    const left = Date.parse(a.startAt ?? "") || 0;
    const right = Date.parse(b.startAt ?? "") || 0;
    return left - right;
  }),
);

const formatDate = (value?: string | null) => {
  if (!value) {
    return "TBD";
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
};

const confirmDelete = async (eventId: string) => {
  const proceed = window.confirm("Delete this event? This action cannot be undone.");
  if (!proceed) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to delete event (${response.status})`);
    }
    state.events = state.events.filter((event) => event.event !== eventId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong deleting the event.";
    state.error = message;
  }
};
</script>

<style scoped>
.admin-events__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.admin-events__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.4rem;
  font-size: 0.75rem;
  opacity: 0.6;
  margin-bottom: 0.5rem;
}

.admin-events__title {
  margin: 0;
  font-size: 2.25rem;
}

.admin-events__create {
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  background: rgba(134, 239, 172, 0.18);
  border: 1px solid rgba(134, 239, 172, 0.35);
  color: #f8fafc;
  text-decoration: none;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  transition: background 150ms ease, transform 150ms ease;
}

.admin-events__create:hover {
  background: rgba(134, 239, 172, 0.28);
  transform: translateY(-2px);
}

.admin-events__status {
  font-size: 0.95rem;
  letter-spacing: 0.08rem;
  opacity: 0.7;
}

.admin-events__status--error {
  color: #f87171;
}

.admin-events__table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(15, 23, 42, 0.55);
  border-radius: 1rem;
  overflow: hidden;
}

.admin-events__table th,
.admin-events__table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  text-align: left;
}

.admin-events__table th {
  font-size: 0.75rem;
  letter-spacing: 0.22rem;
  text-transform: uppercase;
  opacity: 0.6;
}

.admin-events__table tbody tr:hover {
  background: rgba(15, 23, 42, 0.75);
}

.admin-events__link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}

.admin-events__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.admin-events__action {
  background: none;
  border: none;
  color: #86efac;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.16rem;
  font-size: 0.7rem;
}

.admin-events__action--danger {
  color: #f87171;
}

.admin-events__empty {
  padding: 2.5rem;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  border-radius: 1rem;
  text-align: center;
  opacity: 0.7;
}

@media (max-width: 720px) {
  .admin-events__table {
    display: block;
    overflow-x: auto;
  }
}
</style>
