<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from 'stores';

const auth = useAuthStore();
const tab = ref('bug');

const bug = ref({
  title: '',
  description: '',
  severity: '',
});

const feature = ref({
  title: '',
  description: '',
  category: '',
});
</script>

<template>
  <q-page class="card-wrapper">
    <q-card flat bordered class="feedback-card">
      <q-tabs v-model="tab" indicator-color="transparent">
        <q-tab name="bug" label="Report a Bug" icon="fa-solid fa-bug" />
        <q-tab name="feature" label="Suggest a Feature" icon="fa-solid fa-code" />
      </q-tabs>

      <q-separator class="q-my-md" />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="bug">
          <form action="https://formspree.io/f/xblkkgzp" method="POST">
            <q-input
              v-model="bug.description"
              name="description"
              label="Bug Description"
              type="textarea"
              outlined
              required
            />
            <q-select
              v-model="bug.severity"
              label="Severity"
              :options="['Low', 'Medium', 'High']"
              outlined
              required
            />
            <input type="hidden" name="severity" :value="bug.severity" />
            <input type="hidden" name="_replyto" :value="auth.user?.email" class="q-input" />
            <q-btn label="Submit Bug" color="primary" type="submit" class="q-mt-md submit" />
          </form>
        </q-tab-panel>

        <q-tab-panel name="feature">
          <q-form action="https://formspree.io/f/xnnzzpyg" method="POST">
            <q-input
              name="description"
              v-model="feature.description"
              label="Feature Description"
              type="textarea"
              outlined
              required
            />
            <q-select
              name="category"
              v-model="feature.category"
              label="Category"
              :options="['UI', 'Performance', 'Integration', 'Other']"
              outlined
            />
            <input type="hidden" name="severity" :value="bug.severity" />
            <input type="hidden" name="_replyto" :value="auth.user?.email" class="q-input" />
            <q-btn label="Submit Suggestion" color="primary" type="submit" class="q-mt-md submit" />
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>


<style scoped>
.card-wrapper {
  max-width: 70%;
  margin: 3rem auto;
}
@media (max-width: 600px) {
  .card-wrapper {
    max-width: 90%;
    margin: 1rem auto;
  }
}
</style>
