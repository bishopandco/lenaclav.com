<template>
  <div class="auth-container">
    <h1 class="auth-title">Sign In</h1>
    <form class="auth-form" @submit.prevent="submit">
      <label class="auth-field">
        <span>Email</span>
        <input v-model="email" type="email" name="email" autocomplete="email" required />
      </label>
      <label class="auth-field">
        <span>Password</span>
        <input v-model="password" type="password" name="password" autocomplete="current-password" required />
      </label>
      <button class="auth-submit" type="submit" :disabled="auth.loading.value">
        {{ auth.loading.value ? "Signing In…" : "Sign In" }}
      </button>
    </form>
    <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
    <p class="auth-links">
      <RouterLink to="/reset-password">Forgot password?</RouterLink>
      <span aria-hidden="true">•</span>
      <RouterLink to="/signup">Create an account</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref<string | null>(null);

const submit = async () => {
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    const redirect = (route.query.redirect as string) || "/admin";
    await router.push(redirect);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Unable to sign in. Please try again.";
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 420px;
  margin: 4rem auto;
  padding: 2.5rem;
  background: rgba(15, 23, 42, 0.85);
  border-radius: 1rem;
  color: #e2e8f0;
  box-shadow: 0 25px 35px rgba(15, 23, 42, 0.35);
}

.auth-title {
  margin: 0 0 1.5rem;
  font-size: 2rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.auth-form {
  display: grid;
  gap: 1.25rem;
}

.auth-field {
  display: grid;
  gap: 0.5rem;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-field input {
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.6);
  color: inherit;
  outline: none;
  transition: border 150ms ease, background 150ms ease;
}

.auth-field input:focus {
  border-color: rgba(94, 234, 212, 0.6);
  background: rgba(15, 23, 42, 0.85);
}

.auth-submit {
  padding: 0.9rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.85), rgba(94, 234, 212, 0.85));
  color: #0f172a;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: filter 150ms ease;
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.auth-submit:not(:disabled):hover {
  filter: brightness(1.1);
}

.auth-error {
  margin-top: 1rem;
  color: #f87171;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
}

.auth-links {
  margin-top: 1.75rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-links a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border 150ms ease;
}

.auth-links a:hover {
  border-bottom-color: currentColor;
}

@media (max-width: 640px) {
  .auth-container {
    margin: 2.5rem 1rem;
    padding: 2rem 1.5rem;
  }
}
</style>
