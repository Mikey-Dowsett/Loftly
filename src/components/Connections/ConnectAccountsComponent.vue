<script setup lang="ts">
import { ref, watch } from 'vue';
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

const isDeleteDialogOpen = ref(false);
const confirmingDelete = ref<number | null>(null);

watch(
  () => accounts.accounts,
  () => {
  },
  { deep: true },
);
</script>

<template>
  <q-card v-if="accounts.accounts" class="account-wrapper">
    <!--Account Interaction-->
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
      <q-btn :label="item.handle" :href="item.account_url" target="_blank" flat no-caps style="margin-left: 0; margin-right: auto">
        <q-tooltip>Open this account page</q-tooltip>
      </q-btn>
      <div class="actions">
        <q-toggle color="positive" v-model="item.enabled" size="sm"
                  :disable="!item.enabled && accounts.enabledAccounts.length === plan.plan?.account_limit">
          <q-tooltip v-if="item.enabled || accounts.enabledAccounts.length !== plan.plan?.account_limit">Post to this account?</q-tooltip>
          <q-tooltip v-else>Upgrade your plan to enable more than {{ plan.plan?.account_limit }} accounts</q-tooltip>
        </q-toggle>
        <q-btn
          icon="fa-solid fa-trash"
          color="negative"
          round
          flat
          size="sm"
          @click="
            confirmingDelete = item.id;
            isDeleteDialogOpen = true;
          "
        >
          <q-tooltip>Delete this account?</q-tooltip>
        </q-btn>
      </div>

      <!--Delete Account Dialog-->
      <q-dialog v-model="isDeleteDialogOpen" :persistent="true">
        <q-card>
          <q-card-section class="row items-center">
            <q-icon
              name="fa-solid fa-triangle-exclamation"
              color="negative"
              flat
              size="lg"
              class="q-mr-lg"
            />
            <h4 style="font-size: medium; font-weight: bold">
              Are you sure you want to disconnect this account?
            </h4>
          </q-card-section>

          <q-card-actions>
            <q-btn
              label="Cancel"
              color="positive"
              @click="isDeleteDialogOpen = false"
              class="dialog-btn"
            />
            <q-btn
              label="Delete"
              color="negative"
              v-close-popup
              class="dialog-btn"
              @click="
                accounts.deleteConnectedAccount(confirmingDelete ?? -1);
                isDeleteDialogOpen = false;
              "
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <!--Delete Account Dialog-->
    </q-card-section>

    <q-btn :label="`Add New Account`" class="submit q-btn-new" color="positive" size="md" to="/settings/connections" />
  </q-card>
</template>

<style scoped>
.account-wrapper {
  max-height: 75%;
  width: 26%;
  padding: 1rem;
  margin: 3rem auto;
  overflow-y: auto;

  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  left: 2.5%;
  z-index: 2;
}
.card-section {
  display: flex;
  align-items: center;
  padding: 1rem;
}
.actions {
  display: flex;
  margin-left: auto;
  margin-right: 0;
}
.q-btn {
  font-size: 1rem;
  overflow-x: hidden;
}
.q-btn-new {
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
}
.dialog-btn {
  padding: 0 1.5rem;
}
</style>
