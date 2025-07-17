<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore, usePixelfedStore } from 'stores'

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const pixelfed = usePixelfedStore();

onMounted(async () => {
  const auth = useAuthStore();
  if (!auth.user) {
    $q.notify({
      type: 'negative',
      message: 'Please login first.',
      position: 'top-right'
    });
    return await router.push('/');
  }
  const code = route.query.code as string;
  const instance = String(route.query.state);

  if (!code) {
    $q.notify({
      type: 'negative',
      message: 'No code returned from Pixelfed.',
      position: 'top-right'
    });
    return await router.push('/post');
  }

  try {
    const response = await pixelfed.connectAccount(code, instance);

    if(response === 'Account Connected')
      $q.notify({
        type: 'positive',
        message: 'Pixelfed account connected!',
        position: 'top-right'
      });
    else
      $q.notify({
        type: 'negative',
        message: typeof response === 'string' ? response : 'Unexpected Pixelfed response.',
        position: 'top-right'
      })
    return await router.push('/post');
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: 'Pixelfed connection failed.',
      position: 'top-right'
    });
    return await router.push('/post');
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
