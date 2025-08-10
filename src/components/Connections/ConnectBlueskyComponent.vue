<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { eventBus } from 'src/tools/event-bus';
import { usePlansStore, useAccountsStore, useBlueskyStore } from 'stores';
import { useErrorHandling } from 'src/composables/useErrorHandling';
import { useNotify } from 'src/composables/useNotifications';

const plan = usePlansStore();
const accounts = useAccountsStore();
const bluesky = useBlueskyStore();
const { handleError } = useErrorHandling();
const { notifySuccess } = useNotify();

const handle = ref('');
const appPassword = ref('');
const modelValue = defineModel<boolean | null>({ default: false });

async function connectAccount() {
  handle.value.replace('@', '');
  const response = await bluesky.connectAccount(handle.value, appPassword.value);

  if (response === 'Account Connected') {
    notifySuccess(response);
  } else {
    handleError(response);
  }
}

function closeWindow() {
  eventBus.emit('close-bluesky-login');
}

onMounted(() => {
  if (!plan.plan?.account_limit) {
    closeWindow();
    return;
  }
  if (accounts.accounts?.length >= plan.plan?.account_limit) {
    handleError('You have reached your account limit.');
    closeWindow();
    return;
  }
});
</script>

<template>
  <q-dialog v-model="modelValue">
    <q-card>
      <h4>Connect Bluesky Account</h4>
      <q-form @submit.prevent="connectAccount" autocomplete="off">
        <q-input v-model="handle" label="Handle" required outlined autocomplete="off">
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-at" />
          </template>
        </q-input>
        <q-input
          v-model="appPassword"
          label="App Password"
          required
          outlined
          autocomplete="off"
          hint="Found in: Settings -> Privacy and Security -> App Passwords"
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-key" />
          </template>
        </q-input>
        <q-btn type="Submit" label="Connect" class="submit" color="positive" />
      </q-form>
      <q-btn icon="fa-solid fa-close" flat round class="close" @click="closeWindow" />
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
