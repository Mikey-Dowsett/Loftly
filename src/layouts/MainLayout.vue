<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { initializeStores } from 'stores'
import HeaderComponent from 'src/components/HeaderComponent.vue'
import FooterComponent from 'src/components/FooterComponent.vue'

const isReady = ref(false);

onMounted(async () => {
  await initializeStores();
  isReady.value = true;
});
</script>

<template>
  <HeaderComponent />
  <q-page-container>
    <router-view v-if="isReady" />
  </q-page-container>
  <FooterComponent />
</template>

<style scoped>

</style>
