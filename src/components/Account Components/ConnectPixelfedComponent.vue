<script setup lang="ts">
import { ref } from 'vue'
import { type Instances } from 'src/stores/models'
import { eventBus } from 'src/tools/event-bus'
import { usePixelfedStore } from 'stores'

const pixelfedStore = usePixelfedStore();
const modelValue = defineModel<boolean | null>({ default: false });
const instances = pixelfedStore.getInstances;
const instance = ref('')

async function connectAccount() {
  console.log('connecting account')
  if (!instances.find((x: Instances) => x.instance === instance.value)) {
    console.log("Adding new instance")
    await pixelfedStore.registerInstance(instance.value);
  }

  const scope = 'read write';
  const selectedInstance = instances.find((x: Instances) => x.instance === instance.value);
  const redirectUri = 'http://localhost:9000/pixelfed/callback';

  if (!selectedInstance) return;

  const authUrl = `https://${selectedInstance.instance}/oauth/authorize` +
    `?client_id=${selectedInstance.client_key}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${instance.value}`;

  console.log("Redirecting to Pixelfed:", authUrl);

  window.location.href = authUrl;
}

function closeWindow() {
  eventBus.emit('close-pixelfed-login');
}
</script>

<template>
  <q-dialog v-model="modelValue">
    <q-card>
      <h4 class="q-mt-lg">Connect Pixelfed Account</h4>
      <q-form @submit.prevent="connectAccount" autocomplete="off">
        <q-input v-model="instance" standout label="Instance"
          hint="e.g. pixelfed.social" required/>
        <q-btn type="submit" label="Connect" class="submit" color="positive" />
      </q-form>
      <q-btn icon="fa-solid fa-close" flat round class="close" @click="closeWindow" />
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-btn {
  margin: 0.25rem;
}
</style>
