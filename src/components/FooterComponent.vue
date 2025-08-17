<script setup lang="ts">
const currentYear = new Date().getFullYear()
const links = {
  social: [
    { icon: 'fa-brands fa-github', label: 'GitHub', url: 'https://github.com/Mikey-Dowsett/Loftly' },
    { icon: 'fa-brands fa-mastodon', label: 'Mastodon', url: 'https://mastodon.social/@mikeydowsett' },
  ],
  quickLinks: [
    { label: 'Home', route: '/' },
    { label: 'Feedback', route: '/feedback' },
    { label: 'Privacy Policy', route: '/privacy-policy' },
    { label: 'Terms of Service', route: '/terms-of-service' },
  ]
}
</script>

<template>
  <q-footer class="footer-container">
    <div class="footer-content">
      <div class="footer-section">
        <h6>About</h6>
        <p>Loftly is an open, cross-platform social media manager for the Fediverse. Connect Mastodon, Pixelfed, Lemmy, and Bluesky accounts in one place — post everywhere at once, track engagement, and manage your online presence without the walled gardens.
        </p>
      </div>

      <div class="footer-section">
        <h6>Quick Links</h6>
        <nav>
          <router-link v-for="link in links.quickLinks"
                       :key="link.label"
                       :to="link.route">
            {{ link.label }}
          </router-link>
        </nav>
      </div>

      <div class="footer-section">
        <h6>Connect</h6>
        <div class="social-links">
          <q-btn v-for="social in links.social"
                 :key="social.label"
                 flat
                 :icon="social.icon"
                 :label="social.label"
                 :href="social.url"
                 target="_blank" />
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} Loftly</p>
    </div>
  </q-footer>
</template>

<style scoped>
.footer-container {
  background-color: var(--q-background);
  color: var(--q-text);
  box-shadow: 0 -2px 10px var(--q-primary);
  margin-top: 3rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section {
  text-align: left;
}

.footer-section h6 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--q-primary);
}

.footer-section nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-section a {
  color: var(--q-text);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: var(--q-primary);
}

.social-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.footer-bottom {
  border-top: 1px solid var(--q-primary);
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-section nav {
    align-items: center;
  }

  .social-links {
    justify-content: center;
  }
}
</style>
