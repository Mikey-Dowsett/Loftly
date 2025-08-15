<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showDrawer = ref(false)

const items = [
  { label: 'Account Settings', to: '/settings/account', icon: 'fa-solid fa-circle-user' },
  { label: 'Connections', to: '/settings/connections', icon: 'fa-solid fa-link' },
  { label: 'Subscription', to: '/settings/subscription', icon: 'fa-solid fa-money-check' },
];

const currentPageLabel = computed(() => {
  const currentItem = items.find(item => item.to === route.path)
  return currentItem?.label || 'Settings'
})
</script>

<template>
  <div class="settings-layout">
    <!-- Sidebar + Content Card -->
    <q-card class="settings-card">
      <div class="card-content">
        <!-- Mobile menu button -->
        <div class="mobile-menu">
          <q-btn flat round icon="fa-solid fa-bars" @click="showDrawer = true" class="lt-md" :label="currentPageLabel" />
        </div>

        <!-- Sidebar List -->
        <q-list padding class="sidebar-list gt-sm">
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

        <!-- Mobile drawer -->
        <q-drawer
          v-model="showDrawer"
          side="left"
          bordered
          class="lt-md"
        >
          <q-list padding>
            <q-item
              v-for="item in items"
              :key="item.label"
              clickable
              :to="item.to"
              class="link"
              active-class="active-link"
              exact
              @click="showDrawer = false"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>
                <h6 class="q-ma-none">{{ item.label }}</h6>
              </q-item-section>
            </q-item>
          </q-list>
        </q-drawer>

        <q-separator vertical style="height: auto; margin: 1rem" class="gt-sm" />
        <q-separator class="ls-md" />

        <div class="router-content">
          <router-view />
        </div>
      </div>
    </q-card>
  </div>
</template>

<style scoped>
.settings-layout {
  display: flex;
  width: 75%;
  margin: 3rem auto;
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

@media (max-width: 1024px) {
  .settings-layout {
    width: 90%;
    margin: 1rem auto;
  }

  .card-content {
    flex-direction: column;
  }

  .router-content {
    padding: 0;
  }

  .mobile-menu {
    display: flex;
    justify-content: flex-start;
  }
}
</style>
