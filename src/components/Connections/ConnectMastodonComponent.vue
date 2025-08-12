<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { eventBus } from 'src/tools/event-bus';
import { useAccountsStore, useMastodonStore, usePlansStore } from 'stores';
import { useErrorHandling } from 'src/composables/useErrorHandling';

const plan = usePlansStore();
const accounts = useAccountsStore();
const mastodon = useMastodonStore();
const { handleError } = useErrorHandling();

const instance = ref('');
const modelValue = defineModel<boolean | null>({ default: false });

async function connectAccount() {
  try {
    await mastodon.startAccountConnection(instance.value);
  } catch (error) {
    handleError(error);
  }
}

function closeWindow() {
  eventBus.emit('close-mastodon-login');
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
      <h4 class="q-mt-lg">Connect Mastodon Account</h4>
      <q-form @submit.prevent="connectAccount" autocomplete="off">
        <q-input v-model="instance" standout label="Instance"
                 hint="e.g. mastodon.social" required/>
        <q-btn type="submit" label="Connect" class="submit" color="positive" :loading="mastodon.loading" />
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
