<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore, useMastodonStore } from 'stores'

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const mastodon = useMastodonStore();

onMounted(async () => {
  if(!auth.user) {
    $q.notify({
      type: 'negative',
      message: 'Please login first.',
      position: 'top-right'
    });
    return await router.push('/');
  }
  const code = route.query.code as string;
  const id = Number(route.query.state);

  if (!code) {
    $q.notify({
      type: 'negative',
      message: 'No code returned from Mastodon.',
      position: 'top-right'
    });
    return await router.push('/post');
  }

  try {
    const response = await mastodon.connectAccount(code, id);

    if(response == 'Account Connected')
      $q.notify({
        type: 'positive',
        message: 'Mastodon account connected!',
        position: 'top-right'
      });
    else
      $q.notify({
        type: 'negative',
        message: response,
        position: 'top-right'
      })
    return await router.push('/post');
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: 'Mastodon connection failed.',
      position: 'top-right'
    });
    return await router.push('/post');
  }
});
</script>

<template>
  <div class="absolute-center" style="text-align: center;">
    <q-spinner-comment color="primary" size="25%" />
    <h4>Connecting to Mastodon...</h4>
  </div>
</template>

<style scoped>

</style>
