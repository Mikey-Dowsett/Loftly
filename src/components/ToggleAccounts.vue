<script setup lang="ts">
import { watch} from 'vue'

const accounts = defineProps<{
  modelValue: {
    platform: string,
    handle: string,
    access_token: string,
    did: string,
    app_password: string,
    enabled: boolean,
  }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof accounts.modelValue): void
}>()

watch(() => accounts.modelValue, (newVal) => {
  console.log('modelValue updated:', newVal);
}, {deep: true});
</script>

<template>
  <q-card>
    <q-card-section class="card-section">
        <q-icon name="fa-brands fa-bluesky" size="xl" style="color: #1185fe;"/>
        <h5>Bluesky</h5>
      </q-card-section>
    <q-card-section class="card-section" v-for="(account, i) in accounts.modelValue" :key="i">
      <q-icon name="fa-solid fa-at" />
      <h4>{{ account.handle }}</h4>
      <q-toggle v-model="account.enabled" color="positive"
                checked-icon="fa-solid fa-check" unchecked-icon="fa-solid fa-xmark"
                @toggle="emit('update:modelValue', accounts.modelValue)" />
    </q-card-section>
  </q-card>
</template>

<style scoped>
.q-card {
  max-width: 40%;
  padding: 1rem;
  margin: 3rem auto;
  overflow-y: auto;
}
.q-icon {
  margin-right: 1rem;
}
.card-section {
  display: flex;
  align-items: center;
  padding: 1rem;
}
.q-toggle {
  margin-right: 0;
  margin-left: auto;
}
h4 {
  font-size: 1rem;
}
</style>
