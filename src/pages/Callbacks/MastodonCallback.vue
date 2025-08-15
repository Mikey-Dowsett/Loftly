<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore, useMastodonStore } from 'stores'
import { useErrorHandling } from 'src/composables/useErrorHandling';
import { useNotify } from 'src/composables/useNotifications';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { handleError } = useErrorHandling();
const { notifySuccess } = useNotify();
const mastodon = useMastodonStore();

onMounted(async () => {
  if(!auth.user) {
    handleError('Please login first');
    return await router.push('/');
  }

  const code = route.query.code as string;
  const instance = String(route.query.state);

  try {
    const response = await mastodon.connectAccount(code, instance);

    if(response === 'Account Connected')
      notifySuccess(response);
    else
      handleError(response);
  } catch (error) {
    handleError(error);
  } finally {
    await router.push('/settings/connections');
  }
});
</script>

<template>
  <div class="absolute-center" style="text-align: center;">
    <q-spinner-comment color="primary" size="100px" />
    <h4>Connecting to Mastodon...</h4>
  </div>
</template>

<style scoped>

</style>
