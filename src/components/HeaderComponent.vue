<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Dark, QMenu } from 'quasar'
import { eventBus } from '../tools/event-bus'
import { useAuthStore } from 'stores/auth'
import LoginWindow from '../components/LoginWindow.vue'

const showLoginWindow = ref(false)
const menuRef = ref<InstanceType<typeof QMenu> | null>(null)

const auth = useAuthStore()

onMounted(async () => {
  await auth.init()
})

const showLogin = () => {
  showLoginWindow.value = true
}

const toggleDark = () => {
  Dark.set(!Dark.mode)
  console.log(Dark.mode)
}

eventBus.on('logged-in', () => {
  showLoginWindow.value = false
})
</script>

<template>
<div class="container">
  <router-link to="/" class="link">
    <div class="logo">
      <q-img src="/icons/logo.png" alt="Loftly Logo" />
      <h4>Loftly</h4>
    </div>
  </router-link>
  <div v-if="!auth.loading" class="account">
    <router-link to="/CreatePost" class="link" active-class="link-active">
      <h4 style="font-size: x-large">Create Post</h4>
    </router-link>
    <router-link to="/ConnectAccounts" class="link" active-class="link-active">
      <h4 style="font-size: x-large">Accounts</h4>
    </router-link>

    <q-btn v-if="auth.user" round flat icon="person" size="lg" aria-label="Account Menu">
      <q-menu anchor="bottom end" self="top end" ref="menuRef">
        <q-list style="min-width: 200px">
          <q-item v-if="auth.user">
            <q-item-section>
              <div class="text-weight-bold">{{ auth.user?.email }}</div>
            </q-item-section>
          </q-item>

          <q-item v-if="auth.user" clickable to="/CreatePost" tag="router-link">
            <q-item-section>
              <div class="text-weight-bold">Create Post</div>
            </q-item-section>
          </q-item>

          <q-item v-if="auth.user" clickable to="/ConnectAccounts" tag="router-link">
            <q-item-section>
              <div class="text-weight-bold">Accounts</div>
            </q-item-section>
          </q-item>

          <q-item clickable @click="toggleDark">
            <q-item-section>
              <div class="text-weight-bold">
                {{ Dark.mode ? 'Dark Mode' : 'Light Mode' }}
              </div>
            </q-item-section>
            <q-item-section>
              <q-icon :name="Dark.mode ? 'fa-solid fa-moon' : 'fa-solid fa-sun'" />
            </q-item-section>
          </q-item>

          <q-item clickable @click="auth.signOut()" class="logout">
            <q-item-section>
              <div class="text-weight-bold">Log Out</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
    <q-btn v-show="!auth.user" @click="showLogin" class="account"
           label="Login" flat color="positive" size="lg" />
  </div>
</div>
  <LoginWindow v-if="showLoginWindow" v-model="showLoginWindow" />
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100vw;
  height: 5rem;
  padding: 0 2rem;
  background-color: var(--q-background);
  color: var(--q-text);
  box-shadow: 0 5px 10px var(--q-primary);
  position: relative;
}
.logo {
  display: flex;
  align-items: center;
  z-index: 2;
}
.logo .q-img {
  width: 5rem;
}
.logo h4 {
  font-weight: bold;
}
.account {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2;
}
.login {
  background-color: var(--q-positive);
}
.logout {
  background-color: var(--q-negative);
}

@media (max-width: 600px) {
  .logo h3 {
    font-size: 2rem;
  }

  .logo .q-img {
    height: auto;
  }

  .container {
    height: auto;
    padding: 0.5rem 0;
  }
}
</style>
