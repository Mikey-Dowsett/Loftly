<script setup lang="ts">

</script>

<template>
<div class="container">
  <p>Made with ❤️ using Quasar</p>
  <div class="links">
    <q-btn flat icon="fa-brands fa-github" label="GitHub" href="https://github.com/your-repo" target="_blank" />
    <q-btn flat icon="fa-brands fa-mastodon" label="Mastodon" href="https://mastodon.social/@loftly" target="_blank" />
  </div>
</div>
</template>

<style scoped>
.container {
  padding: 1rem;
  background-color: var(--q-background);
  color: var(--q-text);
  box-shadow: 0 0 20px var(--q-primary);
  text-align: center;
  margin-top: 3rem;
}

.links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
