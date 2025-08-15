<template>
  <q-card class="q-pa-md">
    <div class="q-mb-lg">
      <h1 class="text-h4">Terms of Service</h1>
      <p class="text-caption">Last updated: {{ lastUpdated }}</p>
    </div>

    <div class="q-mb-lg">
      <section v-for="section in sections" :key="section.title" class="q-mb-md">
        <h2 class="text-h5">{{ section.title }}</h2>
        <div v-if="Array.isArray(section.content)">
          <ul>
            <li v-for="(item, idx) in section.content" :key="idx">{{ item }}</li>
          </ul>
        </div>
        <div v-else>
          <p>{{ section.content }}</p>
        </div>
      </section>

      <section class="q-mt-lg">
        <h2 class="text-h6">Contact</h2>
      </section>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const lastUpdated = 'August 14, 2025'

const sections = ref([
  {
    title: '1. Acceptance of Terms',
    content:
      'By using Loftly, you agree to follow these Terms and my Privacy Policy. If you do not agree, please do not use the service.'
  },
  {
    title: '2. Use of Service',
    content: [
      'You are responsible for any content you post using Loftly.',
      'You may only use Loftly for lawful purposes and in accordance with the rules of the connected platforms (Mastodon, Pixelfed, Lemmy, Bluesky).',
      'I reserve the right to suspend or terminate your access if you violate these Terms.'
    ]
  },
  {
    title: '3. Account Security',
    content: [
      'Keep your login credentials secure.',
      'You are responsible for all activity under your account.',
      'I am not liable for unauthorized access if you fail to secure your account.'
    ]
  },
  {
    title: '4. Subscriptions and Payments',
    content: [
      'Some features of Loftly may require a subscription.',
      'All subscription fees are billed in advance and are non-refundable unless otherwise stated.',
      'I may change pricing at any time, but will provide notice before new rates apply.'
    ]
  },
  {
    title: '5. Disclaimer of Warranties',
    content:
      'Loftly is provided “as is” and I make no warranties regarding uptime, performance, or accuracy. Use the service at your own risk.'
  },
  {
    title: '6. Limitation of Liability',
    content:
      'I am not liable for any indirect, incidental, or consequential damages arising from your use of Loftly.'
  },
  {
    title: '7. Changes to Terms',
    content:
      'I may update these Terms from time to time. Significant changes will be communicated via email or in-app. Continued use of Loftly constitutes acceptance of the updated Terms.'
  }
])
</script>

<style scoped>
.q-card {
  max-width: 900px;
  margin: 3rem auto;
}
h2 {
  margin-top: 1rem;
}

@media (max-width: 600px) {
  .q-card {
    width: 90%;
    margin: 1rem;
    padding: 1rem;
  }
}
</style>
