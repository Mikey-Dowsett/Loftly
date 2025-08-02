<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { type Instances } from 'src/stores/models'
import { eventBus } from 'src/tools/event-bus'
import { useAccountsStore, usePixelfedStore, usePlansStore } from 'stores';
import { useErrorHandling } from 'src/composables/useErrorHandling';

const plan = usePlansStore();
const accounts = useAccountsStore();
const pixelfedStore = usePixelfedStore();
const { handleError } = useErrorHandling();

const instances = pixelfedStore.getInstances;
const instance = ref('');
const modelValue = defineModel<boolean | null>({ default: false });

async function connectAccount() {
  try {
    if (!instances.find((x: Instances) => x.instance === instance.value)) {
      await pixelfedStore.registerInstance(instance.value);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const scope = 'read write';
    const selectedInstance = instances.find((x: Instances) => x.instance === instance.value);
    const redirectUri = 'http://localhost:9000/pixelfed/callback';

    if (!selectedInstance) throw new Error('Instance not found');

    const authUrl = `https://${selectedInstance.instance}/oauth/authorize` +
      `?client_id=${selectedInstance.client_key}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${instance.value}`;

    console.log("Redirecting to Pixelfed:", authUrl);

    window.location.href = authUrl;
  } catch (e) {
    handleError(e);
  }
}

function closeWindow() {
  eventBus.emit('close-pixelfed-login');
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
