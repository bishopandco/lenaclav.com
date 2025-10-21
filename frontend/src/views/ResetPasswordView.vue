<template>
  <div class="auth-container">
    <h1 class="auth-title">Reset Password</h1>

    <form v-if="step === 'request'" class="auth-form" @submit.prevent="requestCode">
      <label class="auth-field">
        <span>Email</span>
        <input v-model="email" type="email" autocomplete="email" required />
      </label>
      <button class="auth-submit" type="submit" :disabled="auth.loading.value">
        {{ auth.loading.value ? "Sending…" : "Send Code" }}
      </button>
    </form>

    <form v-else-if="step === 'reset'" class="auth-form" @submit.prevent="resetPassword">
      <p class="auth-instructions">
        Enter the verification code sent to <strong>{{ email }}</strong> and your new password.
      </p>
      <label class="auth-field">
        <span>Verification Code</span>
        <input v-model="code" type="text" required />
      </label>
      <label class="auth-field">
        <span>New Password</span>
        <input v-model="password" type="password" autocomplete="new-password" required />
      </label>
      <button class="auth-submit" type="submit" :disabled="auth.loading.value">
        {{ auth.loading.value ? "Updating…" : "Reset Password" }}
      </button>
    </form>

    <div v-else class="auth-success">
      <p>Password updated. Redirecting to sign in…</p>
      <RouterLink class="auth-submit auth-submit--link" to="/signin">Return to Sign In</RouterLink>
    </div>

    <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
    <p class="auth-links">
      <RouterLink to="/signin">Back to sign in</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

type Step = "request" | "reset" | "done";

const auth = useAuthStore();
const router = useRouter();

const step = ref<Step>("request");
const email = ref("");
const code = ref("");
const password = ref("");
const error = ref<string | null>(null);

const requestCode = async () => {
  error.value = null;
  try {
    await auth.forgotPassword(email.value);
    step.value = "reset";
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Unable to send reset code. Please try again.";
  }
};

const resetPassword = async () => {
  error.value = null;
  try {
    await auth.resetPassword(email.value, code.value, password.value);
    step.value = "done";
    setTimeout(() => {
      router.push("/signin").catch(() => {});
    }, 8000);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Unable to reset password. Please try again.";
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
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.auth-submit:not(:disabled):hover {
  filter: brightness(1.1);
}

.auth-submit--link {
  width: 100%;
}

.auth-instructions {
  font-size: 0.9rem;
  margin: 0;
  letter-spacing: 0.05em;
  line-height: 1.5;
}

.auth-success {
  display: grid;
  gap: 1.5rem;
  font-size: 1rem;
  letter-spacing: 0.04em;
}

.auth-error {
  margin-top: 1rem;
  color: #f87171;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
}

.auth-links {
  margin-top: 1.75rem;
  text-align: center;
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
