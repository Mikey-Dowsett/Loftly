<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar, QForm } from 'quasar';
import { eventBus } from '../tools/event-bus';
import { useAuthStore } from 'stores'

const auth = useAuthStore()

const modelValue = defineModel<boolean | null>({default: false});
const formRef = ref();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const authMode = ref('signIn');
const $q = useQuasar();

const confirmPasswordRule = (val: string) =>
  val === password.value || 'Passwords do not match';

const handleAuth = async () => {
  try {
    if (authMode.value === 'signUp') {
      await auth.signUpWithEmail(email.value, password.value);
    } else {
      await auth.signInWithEmail(email.value, password.value);
    }

    eventBus.emit('logged-in');
    $q.notify({
      type: 'positive',
      message: 'Successfully logged in',
      position: 'top-right',
      timeout: 2000,
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Something went wrong',
      position: 'top-right',
      timeout: 2000,
    });
    console.error(error);
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
