<template>
  <div class="settings-layout">
    <!-- Sidebar -->
    <q-card class="sidebar">
      <q-list bordered padding>
        <q-item
          v-for="item in items"
          :key="item.label"
          clickable
          :to="item.to"
          class="link"
          active-class="active-link"
          exact
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <p class="q-ma-none">{{ item.label }}</p>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Content Area -->
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { label: 'Account Settings', to: '/settings/account', icon: 'fa-solid fa-circle-user' },
  { label: 'Connections', to: '/settings/connections', icon: 'fa-solid fa-link' },
  { label: 'Notifications', to: '/settings/notifications', icon: 'fa-solid fa-bell' },
  { label: 'Appearance', to: '/settings/appearance', icon: 'fa-solid fa-palette' },
  { label: 'Privacy & Security', to: '/settings/privacy', icon: 'fa-solid fa-lock' },
];
</script>

<style scoped>
.settings-layout {
  display: flex;
  margin: 5rem;
}

.sidebar {
  height: 100%;
}

.content {
  flex: 1;
}

.link {
  border-radius: 1rem;
}
.active-link {
  background-color: var(--q-secondary);
  color: black;
  font-weight: bold;
}
.active-link p {
  text-decoration: underline;
  font-weight: bold;
}
</style>
