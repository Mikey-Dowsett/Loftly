<template>
  <q-layout view="lHh Lpr LFf">
    <HeaderComponent />
    <router-view v-if="isReady" />
<!--    <FooterComponent />-->
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { initializeStores } from 'stores'
import HeaderComponent from 'src/components/HeaderComponent.vue'
// import FooterComponent from 'src/components/FooterComponent.vue'

const isReady = ref(false);

onMounted(async () => {
  await initializeStores();
  isReady.value = true;
});
</script>

<style lang="scss">
.body--light {
  --q-primary: #6d9cd8;
  --q-secondary: #a1d6e2;
  --q-accent: #c44569;
  --q-background: #F5F5F5;
  --q-text: #1B1B1B;
  --q-positive: #51905A;
  --q-negative: #e84855;
  --q-info: #2660a4;
  --q-warning: #fada5e;

  --q-bluesky: #1185fe;
  --q-mastodon: #5d52e9;
}
.body--dark {
  --q-primary: #6d9cd8;
  --q-secondary: #a1d6e2;
  --q-accent: #c44569;
  --q-background: #1B1B1B;
  --q-text: #F5F5F5;
  --q-positive: #51905A;
  --q-negative: #e84855;
  --q-info: #2660a4;
  --q-warning: #fada5e;

  --q-bluesky: #1185fe;
  --q-mastodon: #5d52e9;
}
</style>
