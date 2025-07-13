<script setup lang="ts">
import { ref } from 'vue';
import { eventBus } from '../tools/event-bus';
import { useLemmyStore } from 'stores'
import { useErrorHandling } from 'src/composables/useErrorHandling';

const lemmyStore = useLemmyStore();
const { handleError } = useErrorHandling();

const username = ref('');
const password = ref('');
const tfa = ref('');
const instance = ref('');
const modelValue = defineModel<boolean | null>({ default: false });

async function connectAccount() {
  try {
    await lemmyStore.connectAccount(username.value, password.value,
      tfa.value, instance.value);

    closeWindow();
  } catch (error) {
    handleError(error);
  }
}

function closeWindow() {
  eventBus.emit('close-lemmy-login');
}
</script>

<template>
  <q-dialog v-model="modelValue">
    <q-card>
      <h4>Connect Lemmy Account</h4>
      <q-form @submit.prevent="connectAccount" autocomplete="off">
        <q-input
          v-model="username"
          label="Username"
          required
          outlined
          autocomplete="off"
          hint="Username you use to login to lemmy, not email"
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-at" />
          </template>
        </q-input>
        <q-input
          v-model="password"
          label="Password"
          type="password"
          required
          outlined
          autocomplete="off"
          hint="Password you use to login to lemmy, not stored"
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-key" />
          </template>
        </q-input>
        <q-input
          v-model="tfa"
          label="2FA"
          outlined
          autocomplete="off"
          hint="If you have 2FA setup on your lemmy account"
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-key" />
          </template>
        </q-input>
        <q-input
          v-model="instance"
          label="Instance"
          required
          outlined
          autocomplete="off"
          hint="e.g. lemmy.ml"
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-key" />
          </template>
        </q-input>
        <q-btn type="Submit" label="Connect" class="submit" color="positive"
               :loading="lemmyStore.connecting"/>
      </q-form>
      <q-btn icon="fa-solid fa-close" flat round class="close" @click="closeWindow" />
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
