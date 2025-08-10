<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore, usePixelfedStore } from 'stores'
import { useErrorHandling } from 'src/composables/useErrorHandling';
import { useNotify } from 'src/composables/useNotifications';

const route = useRoute();
const router = useRouter();
const { handleError } = useErrorHandling();
const { notifySuccess } = useNotify();
const pixelfed = usePixelfedStore();

onMounted(async () => {
  const auth = useAuthStore();
  if (!auth.user) {
    handleError('Please login first');
    return await router.push('/');
  }
  const code = route.query.code as string;
  const instance = String(route.query.state);

  if (!code) {
    handleError('No code returned from Pixelfed');
    return await router.push('/settings/connections');
  }

  try {
    const response = await pixelfed.connectAccount(code, instance);

    if(response === 'Account Connected')
      notifySuccess(response);
    else
      handleError(response);
    return await router.push('/settings/connections');
  } catch (error) {
    handleError(error);
    return await router.push('/settings/connections');
  }
});
</script>

<template>
  <div class="absolute-center" style="text-align: center;">
    <q-spinner-comment color="primary" size="25%" />
    <h4>Connecting to Pixelfed...</h4>
  </div>
</template>

<style scoped>

</style>
