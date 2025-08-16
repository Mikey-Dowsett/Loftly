<script setup lang="ts">
import { useAccountsStore, usePlansStore } from 'stores';
import { Platform } from 'src/stores/models';

const accounts = useAccountsStore();
const plan = usePlansStore();

const platforms: { name: Platform; label: string; icon: string; color: string }[] = [
  {
    name: Platform.mastodon,
    label: 'Mastodon',
    icon: 'fa-brands fa-mastodon',
    color: '#5d52e9',
  },
  {
    name: Platform.bluesky,
    label: 'Bluesky',
    icon: 'fa-brands fa-bluesky',
    color: '#1185fe',
  },
  {
    name: Platform.pixelfed,
    label: 'PixelFed',
    icon: '/icons/pixelfed.svg',
    color: '#ee1155',
  },
  {
    name: Platform.lemmy,
    label: 'Lemmy',
    icon: '/icons/lemmy.svg',
    color: '#66d7ba',
  },
];
</script>

<template>
  <q-card v-if="accounts.accounts" class="account-wrapper">
    <q-card-section v-for="(item, index) in accounts.accounts" :key="index" class="card-section">
      <template v-if="(platforms.find((x) => x.name === item.platform)?.icon || '').startsWith('/icons/')">
        <q-img
          :src="platforms.find((x) => x.name === item.platform)?.icon"
          style="width: 30px; height: 30px" />
      </template>
      <template v-else>
        <q-icon
          :name="platforms.find((x) => x.name === item.platform)?.icon"
          size="sm"
          :style="'color:' + platforms.find((x) => x.name === item.platform)?.color"
        />
      </template>
      <q-btn :label="item.handle" :href="item.account_url" target="_blank" flat no-caps />
      <div class="actions">
        <q-toggle color="positive" v-model="item.enabled" size="sm"
                  :disable="!item.enabled && accounts.enabledAccounts.length === plan.plan?.account_limit">
          <q-tooltip v-if="!item.enabled && accounts.enabledAccounts.length === plan.plan?.account_limit">
            Upgrade your plan to enable more than {{ plan.plan?.account_limit }} accounts
          </q-tooltip>
        </q-toggle>
      </div>
    </q-card-section>

    <q-btn :label="`Manage Accounts`" class="submit q-btn-new" color="positive" size="md" to="/settings/connections" />
  </q-card>
</template>

<style scoped>
.card-section {
  display: flex;
  align-items: center;
}
.actions {
  display: flex;
  margin-left: auto;
  margin-right: 0;
}
.q-btn {
  font-size: 0.9rem;
  overflow-x: hidden;
}
.q-btn-new {
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 1024px) {
  .q-btn {
    font-size: 1rem;
    overflow-x: hidden;
  }
}
</style>
