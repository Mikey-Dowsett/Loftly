<script setup lang="ts">
import { ref } from 'vue';
import { QForm } from 'quasar';
import { eventBus } from '../tools/event-bus';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores'
import { supabase } from 'src/lib/supabase'
import { useErrorHandling } from 'src/composables/useErrorHandling';
import { useNotify } from 'src/composables/useNotifications';

const router = useRouter();
const auth = useAuthStore()
const { handleError } = useErrorHandling();
const { notifySuccess, notifyInfo } = useNotify();

const modelValue = defineModel<boolean | null>({default: false});
const formRef = ref();
const email = ref('');
const password = ref('');
const siteUrl = import.meta.env.VITE_URL;

const handleAuth = async () => {
  try {
    await auth.signInWithEmail(email.value, password.value);

    eventBus.emit('logged-in');
    notifySuccess('Successfully logged in');

    void(async () => {
      await router.push("/post");
    });
  } catch (error) {
    handleError(error);
    console.error(error);
  }
};

const sendRecoveryEmail = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) {
    handleError(error);
  } else {
    notifyInfo('Recovery email sent!');
  }
};

const closeLoginWindow = () => {
  eventBus.emit('logged-in');
};

const emailRule = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email';

const passwordLengthRule = (val: string) =>
  val.length >= 8 || 'Password must be at least 8 characters';

const securePasswordRule = (val: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(val) ||
  'Password must include uppercase, lowercase, number, and special character';
</script>

<template>
  <q-dialog v-model="modelValue">
    <q-card class="auth-page">
      <q-btn class="close" flat round icon="close" size="lg" @click="closeLoginWindow" color="negative" />

      <div>
        <h2>Login</h2>
        <p>Login below to access your account</p>
      </div>

      <q-form v-model:ref="formRef" @submit.prevent="handleAuth">
        <q-input
          v-model="email" type="email" placeholder="Email"
          class="input" rounded outlined
          :rules="[emailRule]" autocomplete="email">
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>
        <q-input
          v-model="password" type="password"
          placeholder="Password" class="input" rounded outlined
          :rules="[passwordLengthRule, securePasswordRule]" autocomplete="current-password">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <q-btn no-caps type="submit" class="submit btn" color="positive" label="Login" :loading="auth.loading" />

        <div>
          <q-btn flat no-caps class="btn"
            label="Don't have an account yet? Sign Up" href="/signup" />
        </div>
        <div>
          <q-btn flat no-caps class="btn"
            label="Forgot Password?" @click="sendRecoveryEmail" />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.auth-page {
  position: relative;
  text-align: center;
  width: 600px;
  min-height: 50%;
  margin: auto;
  padding: 20px;
  border-radius: 1rem;
  background: var(--q-background);
  color: var(--q-text);
}
.input {
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 1rem;
  border: none;
  color: var(--q-text);
}
.btn {
  padding: 0.5rem 1rem;
  margin: 0.5rem auto;
  border-radius: 1rem;
  color: var(--q-text);
  border: none;
  cursor: pointer;
}

h2 {
  margin: 1rem;
  font-weight: bold;
}
@media (max-width: 600px) {
  .auth-page {
    width: 90%;
  }
}
</style>
