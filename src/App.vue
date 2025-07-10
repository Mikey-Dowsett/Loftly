<template>
  <HeaderComponent />
  <router-view />
</template>

<script setup lang="ts">
import HeaderComponent from 'src/components/HeaderComponent.vue'
</script>

<style lang="scss">
.body--light {
  --q-primary: #6d9cd8;
  --q-secondary: #eedc82;
  --q-accent: #8E3B46;
  --q-background: #F5F5F5;
  --q-text: #1B1B1B;
  --q-positive: #51905A;
  --q-negative: #e84855;
  --q-info: #2660a4;
  --q-warning: #fada5e;
}
.body--dark {
  --q-primary: #6d9cd8;
  --q-secondary: #eedc82;
  --q-accent: #8E3B46;
  --q-background: #1B1B1B;
  --q-text: #F5F5F5;
  --q-positive: #51905A;
  --q-negative: #e84855;
  --q-info: #2660a4;
  --q-warning: #fada5e;
}
</style>
