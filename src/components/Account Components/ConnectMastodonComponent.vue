<script setup lang="ts">
import { ref } from 'vue'
import { eventBus } from 'src/tools/event-bus';
import { useMastodonStore } from 'stores'
import type { Instances } from 'stores/models';
import { useErrorHandling } from 'src/composables/useErrorHandling';

const { handleError } = useErrorHandling();
const mastodon = useMastodonStore();
const modelValue = defineModel<boolean | null>({ default: false });
const instances = mastodon.getInstances;
const instance = ref('')

async function connectAccount() {
  try {
    if (!instances.find((x: Instances) => x.instance === instance.value)) {
      await mastodon.registerInstance(instance.value);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const scope = 'read write';
    const selectedInstance = instances.find((x: Instances) => x.instance === instance.value);
    const redirectUri = 'http://localhost:9000/mastodon/callback';
    console.log('Selected Instance', selectedInstance);
    if (!selectedInstance) throw new Error('Instance not found. Try refreshing the page');

    const authUrl = `https://${instance.value}/oauth/authorize` +
      `?client_id=${selectedInstance?.client_key}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${instance.value}`;

    console.log("Redirecting to Mastodon:", authUrl);

    window.location.href = authUrl;
  } catch (error) {
    handleError(error);
  }
}

function closeWindow() {
  eventBus.emit('close-mastodon-login');
}
</script>

<template>
  <q-dialog v-model="modelValue">
    <q-card>
      <h4 class="q-mt-lg">Connect Mastodon Account</h4>
      <q-form @submit.prevent="connectAccount" autocomplete="off">
        <q-input v-model="instance" standout label="Instance"
                 hint="e.g. mastodon.social" required/>
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
