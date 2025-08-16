<script setup lang="ts">
import { ref } from 'vue'

const lastUpdated = 'August 14, 2025'

const sections = ref([
  {
    title: '1. Information I Collect',
    content: [
      'Account Information: Email address, authentication tokens and credentials for connected accounts (Mastodon, Pixelfed, Lemmy, Bluesky).',
      'Usage Information: Posts you create, schedule, or publish through Loftly, logs of account connections and posting history, basic analytics (e.g., number of posts, platforms used).',
    ]
  },
  {
    title: '2. How I Use Your Information',
    content: [
      'Enable cross-platform posting and account management.',
      'Maintain your posting history for your own records.',
      'We do not sell your personal data to third parties.'
    ]
  },
  {
    title: '3. How I Store and Protect Your Data',
    content: [
      'Authentication tokens are stored securely in our backend (Supabase) and are encrypted at rest.',
      'I follow industry best practices to protect against unauthorized access, alteration, or disclosure.',
    ]
  },
  {
    title: '4. Sharing of Information',
    content: [
      'With service providers that help me operate Loftly (e.g. Supabase).',
      'When required by law or to protect our legal rights.',
      'With your explicit consent for specific actions (e.g., posting to connected accounts).'
    ]
  },
  {
    title: '5. Your Rights',
    content: [
      'Access the personal data I hold about you.',
      'Request corrections or updates.',
      'Request deletion of your data (“Right to be Forgotten”).',
      'Object to certain processing activities.',
      'To exercise these rights, email us at support@loftly.social.'
    ]
  },
  {
    title: '6. Data Retention',
    content:
      'I keep your data only as long as necessary to provide our service. If you delete your account, your data will be deleted within 30 days.'
  },
  {
    title: '7. Cookies & Tracking',
    content:
      'Loftly uses minimal cookies and tracking tools, primarily for authentication sessions and basic analytics (non-personalized). We do not use third-party advertising trackers.'
  },
  {
    title: '8. Changes to This Policy',
    content:
      'I may update this Privacy Policy from time to time. If I make significant changes, I will notify you via email or in-app.'
  }
]);

const email = `mailto:support@loftly.social`;
</script>

<template>
  <q-card class="q-pa-md">
    <div class="q-mb-lg">
      <h1 class="text-h4">Privacy Policy</h1>
      <p class="text-caption">Last updated: {{ lastUpdated }}</p>
    </div>

    <div class="q-mb-lg">
      <p>
        I built Loftly with your privacy in mind. This Privacy Policy
        explains how I collect, use, and protect your information when you use
        my platform to connect and manage your social media accounts.
      </p>

      <section v-for="section in sections" :key="section.title" class="q-mb-md">
        <h2 class="text-h6">{{ section.title }}</h2>
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
        <h2 class="text-h6">Contact Us</h2>
        <q-btn color="primary" :href="email">&#115;&#117;&#112;&#112;&#111;&#114;&#116;&#64;&#108;&#111;&#102;&#116;&#108;&#121;&#46;&#115;&#111;&#99;&#105;&#97;&#108;
        </q-btn>
      </section>
    </div>
  </q-card>
</template>

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
