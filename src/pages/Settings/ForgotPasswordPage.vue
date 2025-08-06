<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores';
import { useErrorHandling } from 'src/composables/useErrorHandling';

const $q = useQuasar();
const auth = useAuthStore();
const { handleError } = useErrorHandling();
const $router = useRouter();

const newPassword = ref('');
const confirmPassword = ref('');

const resetPassword = async () => {
  if (!auth.user) {
    handleError('User not authenticated');
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    handleError('Passwords do not match');
    return;
  }

  try {
    await auth.updateUserPassword(newPassword.value);

    $q.notify({ type: 'positive', message: 'Password reset successfully!', position: 'top-right' });
    await $router.push('/settings/account');
  } catch (error) {
    handleError(error);
  }
};

// function parseHashParams(): Record<string, string> {
//   const href = window.location.href;
//   const hashIndex = href.indexOf('#');
//   const hash = hashIndex >= 0 ? href.substring(hashIndex + 1) : '';
//   const params = new URLSearchParams(hash);
//   const result: Record<string, string> = {};
//   for (const [key, value] of params.entries()) {
//     result[key] = value;
//   }
//   return result;
// }

const passwordLengthRule = (val: string) =>
  val.length >= 8 || 'Password must be at least 8 characters';

const securePasswordRule = (val: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(val) ||
  'Password must include uppercase, lowercase, number, and special character';
</script>

<template>
  <q-card>
    <div v-if="auth.loading">
      <q-spinner />
    </div>
    <div v-else>
      <h5>Set a New Password</h5>
      <q-form @submit.prevent="resetPassword">
        <q-input
          v-model="newPassword"
          label="New Password"
          type="password"
          standout
          class="q-mb-md"
          :rules="[passwordLengthRule, securePasswordRule]"
        />
        <q-input
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          standout
          class="q-mb-md"
          :rules="[passwordLengthRule, securePasswordRule]"
        />
        <q-btn label="Reset Password" type="submit" class="submit" color="primary" />
      </q-form>
    </div>
  </q-card>
</template>

<style scoped>
.q-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
}
</style>
