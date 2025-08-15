<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from 'stores'
import { useErrorHandling } from 'src/composables/useErrorHandling';

const auth = useAuthStore();
const { handleError } = useErrorHandling();

onMounted(async () => {
  try {
    // Extract URL hash fragment
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const access_token = params.get('access_token') ?? '';
    const refresh_token = params.get('refresh_token') ?? '';

    await auth.setSession(access_token, refresh_token);
  } catch (err) {
    handleError(err);
  }
});
</script>

<template>
 <div class="absolute-center" style="text-align: center;">
   <div v-if="auth.loading">
     <q-spinner-comment size="100px" color="primary" />
     <h4>Confirming New Email</h4>
   </div>
   <q-btn v-else class="submit" label="Home" color="positive" to="/" />
 </div>
</template>

<style scoped>

</style>
