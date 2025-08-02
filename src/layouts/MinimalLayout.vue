<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { initializeStores } from 'stores'

const isReady = ref(false);

onMounted(async () => {
  await initializeStores();
  isReady.value = true;
});
</script>

<template>
  <q-page-container>
    <router-view v-if="isReady" />
  </q-page-container>
</template>
