<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar'
import { eventBus } from '../tools/event-bus';
import { useAuthStore } from "stores/auth";

const $q = useQuasar();
const auth = useAuthStore();
const handle = ref('')
const appPassword = ref('')
const modelValue = defineModel<boolean | null>({default: false});

async function connectAccount() {
  const response = await auth.connectBlueskyAccount(handle.value, appPassword.value);
  if(response === 'Account Connected') {
    $q.notify({
      message: 'Connected successfully!',
      type: 'positive',
      position: 'top-right',
    });
  } else {
    $q.notify({
      message: response,
      type: 'negative',
      position: 'top-right',
    });
  }
}

function closeWindow() {
  eventBus.emit('close-bluesky-login')
}
</script>

<template>
  <q-dialog v-model="modelValue">
    <q-card>
      <h2>Connect Bluesky Account</h2>
      <q-form @submit.prevent="connectAccount" autocomplete="off">
        <q-input v-model="handle" label="Handle" required outlined autocomplete="off" name="handle">
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-at" />
          </template>
        </q-input>
        <q-input v-model="appPassword" label="App Password" required outlined autocomplete="off">
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

<style scoped>

</style>
