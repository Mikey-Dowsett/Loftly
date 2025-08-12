<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { eventBus } from 'src/tools/event-bus'
import { useAccountsStore, usePixelfedStore, usePlansStore } from 'stores';
import { useErrorHandling } from 'src/composables/useErrorHandling';

const plan = usePlansStore();
const accounts = useAccountsStore();
const pixelfed = usePixelfedStore();
const { handleError } = useErrorHandling();

const instance = ref('');
const modelValue = defineModel<boolean | null>({ default: false });

async function connectAccount() {
  try {
    await pixelfed.startAccountConnection(instance.value);
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
        <q-btn type="submit" label="Connect" class="submit" color="positive" :loading="pixelfed.loading" />
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
