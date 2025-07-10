<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { createClient, type User } from '@supabase/supabase-js';
import { useQuasar, QForm } from 'quasar';
import { eventBus } from '../tools/event-bus';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const modelValue = defineModel<boolean | null>({default: false});
const formRef = ref();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const authMode = ref('signIn'); // or 'signUp'
/**
 * eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
 */
const user = ref<User | null>(null);
const $q = useQuasar();

const emailRule = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email';

const passwordLengthRule = (val: string) =>
  val.length >= 8 || 'Password must be at least 8 characters';

const securePasswordRule = (val: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(val) ||
  'Password must include uppercase, lowercase, number, and special character';

const confirmPasswordRule = (val: string) =>
  val === password.value || 'Passwords do not match';

const handleAuth = async () => {
  const { data, error } =
    authMode.value === 'signUp'
      ? await supabase.auth.signUp({ email: email.value, password: password.value })
      : await supabase.auth.signInWithPassword({ email: email.value, password: password.value });

  if (error) {
    $q.notify({
      type: 'negative',
      message: error.message,
      position: 'top-right',
      timeout: 2000,
    });
  } else {
    user.value = data.user || (await getCurrentUser());
    eventBus.emit('logged-in');
    $q.notify({
      type: 'positive',
      message: 'Successfully logged in',
      position: 'top-right',
      timeout: 2000,
    });

    if (authMode.value === 'signUp' && user.value) {
      //Create user folder in images
      await supabase.storage
        .from('images')
        .upload(`${user.value.id}/.init`, new Blob(['Initialized']), {
          upsert: false,
          contentType: 'image/*',
        });
      //Create user folder in photos
      await supabase.storage
        .from('videos')
        .upload(`${user.value.id}/.init`, new Blob(['Initialized']), {
          upsert: false,
          contentType: 'image/*',
        });
    }
  }
};

const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

const closeLoginWindow = () => {
  eventBus.emit('logged-in');
};

onMounted(() => {
  document.body.style.overflow = 'hidden';
});
onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <q-dialog v-model="modelValue">
    <q-card class="auth-page">
      <q-btn class="close" flat round icon="close" size="lg" @click="closeLoginWindow" color="negative" />

      <div v-show="authMode === 'signIn'">
        <h2>Login</h2>
        <p>Login below to access your account</p>
      </div>
      <div v-show="authMode === 'signUp'">
        <h2>Sign Up</h2>
        <p>Create an account to continue</p>
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
          v-model="password" v-show="authMode==='signIn'" type="password"
          placeholder="Password" class="input" rounded outlined
          :rules="authMode==='signIn' ? [passwordLengthRule, securePasswordRule] : []" autocomplete="current-password">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>
        <q-input v-model="password" v-show="authMode==='signUp'" type="password" placeholder="Password"
          class="input" rounded outlined
          :rules="authMode==='signUp' ? [passwordLengthRule, securePasswordRule] : []" autocomplete="new-password">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>
        <q-input
          v-model="confirmPassword" v-show="authMode==='signUp'" type="password" placeholder="Confirm Password"
          class="input" rounded outlined
          :rules="authMode==='signUp' ? [confirmPasswordRule, passwordLengthRule, securePasswordRule] : []" autocomplete="new-password">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <q-btn v-show="authMode === 'signIn'" no-caps type="submit" class="btn" color="positive" label="Login" />
        <q-btn v-show="authMode === 'signUp'" no-caps type="submit" class="btn" color="positive" label="Sign Up" />

        <div>
          <q-btn v-show="authMode === 'signIn'" flat no-caps
            label="Don't have an account yet? Sign Up" @click="authMode = 'signUp'" />
          <q-btn v-show="authMode === 'signUp'" no-caps
            flat label="Already have an account? Login" @click="authMode = 'signIn'" />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.auth-page {
  position: relative;
  text-align: center;
  min-width: 25%;
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
  background: #618c54;
  padding: 0.5rem 1rem;
  margin: 1rem;
  border-radius: 1rem;
  color: var(--q-text);
  border: none;
  cursor: pointer;

  transition: 0.2s;
  transform: scale(100%);
}
.btn:hover {
  transition: 0.2s;
  transform: scale(125%);
}

h2 {
  margin: 1rem;
  font-weight: bold;
}
</style>
