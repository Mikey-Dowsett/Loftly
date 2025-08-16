<script setup lang="ts">
import { ref } from 'vue';
import { Dark, QMenu } from 'quasar';
import { eventBus } from '../tools/event-bus';
import { useAuthStore } from 'stores';
import LoginWindow from '../components/LoginWindow.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showLoginWindow = ref(false);
const menuRef = ref<InstanceType<typeof QMenu> | null>(null);

const auth = useAuthStore();

const showLogin = () => {
  showLoginWindow.value = true;
}

const toggleDark = () => {
  Dark.set(!Dark.mode);
  console.log(Dark.mode);
}

const signOut = async () => {
  await auth.signOut();
  await router.push("/");
}

eventBus.on('logged-in', () => {
  showLoginWindow.value = false;
  void(async () => {
    await router.push("/post");
  })
});

eventBus.on('show-login', () => {
  showLoginWindow.value = true;
});
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
    <div class="desktop-links">
      <router-link v-if="auth.user" to="/post" class="link" active-class="link-active">
        <h4 style="font-size: x-large">Create Post</h4>
      </router-link>
      <router-link to="/pricing" class="link" active-class="link-active">
        <h4 style="font-size: x-large">Pricing</h4>
      </router-link>
    </div>
    <q-btn v-show="!auth.user" @click="showLogin"
           label="Login" flat color="positive" size="lg" no-caps style="font-size: x-large; font-weight: normal;" />

    <q-btn v-if="auth.user" round flat icon="person" size="lg" aria-label="Account Menu">
      <q-menu anchor="bottom end" self="top end" ref="menuRef">
        <q-list style="min-width: 200px">
          <q-item v-if="auth.user">
            <q-item-section>
              <div class="text-weight-bold">{{ auth.user?.email }}</div>
            </q-item-section>
          </q-item>

          <q-item v-if="auth.user" clickable to="/post" tag="router-link" active-class="link-active">
            <q-item-section side>
              <q-icon name="fa-solid fa-feather-pointed" size="sm" color="primary" />
            </q-item-section>
            <q-item-section>
              <div class="text-weight-bold">Create Post</div>
            </q-item-section>
          </q-item>

          <q-item v-if="auth.user" clickable to="/history" tag="router-link" active-class="link-active">
            <q-item-section side>
              <q-icon name="fa-solid fa-clock" size="sm" color="primary" />
            </q-item-section>
            <q-item-section>
              <div class="text-weight-bold">History</div>
            </q-item-section>
          </q-item>

          <q-item v-if="auth.user" clickable to="/settings" tag="router-link" active-class="link-active">
            <q-item-section side>
              <q-icon name="fa-solid fa-cog" size="sm" color="primary" />
            </q-item-section>
            <q-item-section>
              <div class="text-weight-bold">Settings</div>
            </q-item-section>
          </q-item>
          <q-item v-if="auth.user" clickable to="/feedback" tag="router-link" active-class="link-active">
            <q-item-section side>
              <q-icon name="fa-solid fa-bug" size="sm" color="primary" />
            </q-item-section>
            <q-item-section>
              <div class="text-weight-bold">Feedback</div>
            </q-item-section>
          </q-item>

          <q-item clickable @click="toggleDark">
            <q-item-section side>
              <q-icon :name="Dark.mode ? 'fa-solid fa-moon' : 'fa-solid fa-sun'" size="sm"
                color="primary" />
            </q-item-section>
            <q-item-section>
              <div class="text-weight-bold">
                {{ Dark.mode ? 'Dark Mode' : 'Light Mode' }}
              </div>
            </q-item-section>
          </q-item>

          <q-item clickable @click="signOut()" class="logout">
            <q-item-section>
              <div class="text-weight-bold">Log Out</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
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
  box-shadow: 0 0 20px var(--q-primary);
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

.desktop-links {
  display: flex;
  gap: 1rem;
}

.account {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2;
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

  .desktop-links {
    display: none;
  }

  .account {
    margin-right: 1rem;
  }

  .container {
    height: auto;
    padding: 0.5rem 0;
  }
}
</style>
