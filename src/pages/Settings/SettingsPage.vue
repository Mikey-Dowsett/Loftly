<template>
  <div class="settings-layout">
    <!-- Sidebar + Content Card -->
    <q-card class="settings-card">
      <div class="card-content">
        <q-list padding class="sidebar-list">
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
              <h6 class="q-ma-none">{{ item.label }}</h6>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator vertical style="height: auto" />
        <div class="router-content">
          <router-view />
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
const items = [
  { label: 'Account Settings', to: '/settings/account', icon: 'fa-solid fa-circle-user' },
  { label: 'Connections', to: '/settings/connections', icon: 'fa-solid fa-link' },
  { label: 'Subscription', to: '/settings/subscription', icon: 'fa-solid fa-money-check' },
];
</script>

<style scoped>
.settings-layout {
  display: flex;
  margin: 5rem;
}

.settings-card {
  width: 100%;
  display: flex;
}

.card-content {
  display: flex;
  width: 100%;
  min-height: 400px;
}

.sidebar-list {
  min-width: 220px;
  max-width: 260px;
}

.router-content {
  flex: 1;
  padding: 2rem;
}

.link {
  border-radius: 1rem;
  margin: 1rem 0;
}
.active-link {
  background-color: var(--q-secondary);
  color: black;
  font-weight: bold;
}
.active-link h6 {
  text-decoration: underline;
  font-weight: bold;
}
</style>
