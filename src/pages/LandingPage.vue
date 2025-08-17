<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section style="margin-top: 3rem;">
      <q-img :src="'images/uploading.svg'" style="max-width: 400px;" class="q-mb-sm" />
      <h1 class="text-h3 text-weight-bold q-mb-sm">Where all your accounts take flight</h1>
      <p class="text-subtitle1 q-mb-md">
        Draft once and publish to Bluesky, Mastodon, Lemmy, and more – instantly.
      </p>
      <q-btn color="primary" text-color="black" label="Start Posting Now" size="lg" :to="getStartedLink" class="call-to-action" />
<!--      <q-btn flat label="Explore How It Works" color="secondary" to="#how-it-works" />-->
    </section>

    <q-separator />

    <!-- Features Section -->
    <section id="how-it-works" class="q-mb-xl">
      <div class="text-center q-mb-lg" style="margin-bottom: 3rem;">
        <h4 class="text-weight-bold" >Why Loftly?</h4>
      </div>
      <div class="row q-col-gutter-lg" style="margin: auto">
        <q-card v-for="feature in features" :key="feature.title" class="feature-card" >
          <q-card-section>
            <q-icon :name="feature.icon" size="40px" color="accent" />
            <div class="text-h6 text-weight-bold q-mb-xs">{{ feature.title }}</div>
            <div class="text-body2">{{ feature.description }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="text-center q-mt-xl">
        <q-card class="platforms-card">
          <q-card-section>
            <h4>Supported Platforms</h4>
          </q-card-section>
          <div class="platforms-grid">
            <q-card-section v-for="platform in platforms" :key="platform.title" class="platform">
              <a :href="platform.link" target="_blank">
                <q-icon v-if="platform.icon.endsWith('.svg')" :name="'img:' + platform.icon"
                        :style="{color: platform.color}" size="40px" />
                <q-icon v-else :name="platform.icon"
                        :style="{color: platform.color}" size="40px" />
                <div class="text-h6 text-weight-bold q-mb-xs">{{ platform.title }}</div>
              </a>
            </q-card-section>
          </div>
        </q-card>
      </div>
    </section>

    <q-separator />

    <!-- Demo / Preview Section -->
    <section class="q-mb-xl text-center">
      <h4 class="text-weight-bold">See It in Action</h4>
      <h5>Compose and post to your favorite Fediverse platforms in one go.</h5>
      <q-img src="images/loftly-post.png" style="max-width: 90%;" class="demo-image" />
    </section>

    <q-separator />

    <!-- Call to Action -->
    <section class="q-mb-xl text-center">
      <h2 class="text-h4 q-my-md">Ready to streamline your fediverse posts?</h2>
      <q-btn size="lg" color="primary" label="Get Started Free" :to="getStartedLink" text-color="black" class="call-to-action" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from 'stores';
const auth = useAuthStore();
const features = [
  {
    icon: 'fa-solid fa-pencil',
    title: 'Unified Composer',
    description: 'Write once and publish to multiple platforms instantly.',
  },
  {
    icon: 'fa-solid fa-puzzle-piece',
    title: 'Custom Instances',
    description: 'Support for your favorite or private Fediverse servers.',
  },
  // {
  //   icon: 'fa-solid fa-calendar-days',
  //   title: 'Scheduled Posts',
  //   description: 'Plan ahead and let Loftly handle the timing.',
  // },
  {
    icon: 'fa-solid fa-user-shield',
    title: 'Privacy First',
    description: 'No tracking. No ads. Your data stays yours.',
  },
  // {
  //   icon: 'fa-solid fa-robot',
  //   title: 'Smart Suggestions',
  //   description: 'Get AI help to improve or rephrase your posts.',
  // },
  // {
  //   icon: 'fa-solid fa-chart-line',
  //   title: 'Cross-platform Analytics',
  //   description: 'Understand how your posts perform everywhere.',
  // },
];

const platforms = [
  {
    icon: 'fa-brands fa-mastodon',
    title: 'Mastodon',
    color: '#5d52e9',
    link: 'https://joinmastodon.org/'
  },
  {
    icon: 'fa-brands fa-bluesky',
    title: 'Bluesky',
    color: '#1185fe',
    link: 'https://bsky.app/'
  },
  {
    icon: "/icons/pixelfed.svg",
    title: 'Pixel Fed',
    color: '#ffffff',
    link: 'https://pixelfed.org/'
  },
  {
    icon: '/icons/lemmy.svg',
    title: 'Lemmy',
    color: '#66d7ba',
    link: 'https://join-lemmy.org/'
  }
];

const getStartedLink = auth.user ? "/post" : "/signup";
</script>

<style scoped>
.landing-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
.feature-card {
  margin: 1rem;
  flex: 1 1 300px;
  max-width: 400px;
  min-width: 280px;
  height: auto;
  transition: transform 0.2s ease;
}
.feature-card:hover {
  transform: scale(1.05);
}
.q-icon {
  margin-bottom: 1.5rem;
  font-size: 48px;
}
.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.call-to-action {
  transition: all 0.2s ease;
}

.call-to-action:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px var(--q-primary);
}

section {
  text-align: center;
}

.q-separator {
  margin-top: 3rem;
  margin-bottom: 3rem;
}

.platforms-card {
  width: 100%;
  height: auto;
  margin: 0 auto;
  padding: 0;
}

.demo-image {
  width: 90%;
  max-width: 1000px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  border-radius: 1rem;
  transition: transform 0.3s ease;
}
.demo-image:hover {
  transform: scale(1.05);
}
@media (max-width: 600px) {
  .landing-page {
    max-width: 100%;
  }

  .platforms-grid {
    gap: 1rem;
    padding: 1rem;
  }
}
</style>
