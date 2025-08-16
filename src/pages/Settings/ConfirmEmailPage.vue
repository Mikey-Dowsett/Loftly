<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores'
import { useNotify } from 'src/composables/useNotifications';
import { useErrorHandling } from 'src/composables/useErrorHandling';

const auth = useAuthStore();
const $router = useRouter();
const { notifySuccess } = useNotify();
const { handleError } = useErrorHandling();

onMounted(async () => {
  try {
    await auth.fetchUser();
    notifySuccess('Successfully updated your email');
  } catch (error) {
    handleError(error);
  } finally {
    await $router.push('/settings/account');
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
