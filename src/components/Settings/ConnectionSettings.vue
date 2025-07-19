<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar'
import { eventBus } from 'src/tools/event-bus';
import { useAccountsStore } from 'stores';
import { Platform, type ConnectedAccount } from 'src/stores/models';

import ConnectLemmyComponent from 'components/Account Components/ConnectLemmyComponent.vue';
import ConnectPixelfedComponent from 'components/Account Components/ConnectPixelfedComponent.vue';
import ConnectMastodonComponent from 'components/Account Components/ConnectMastodonComponent.vue';
import ConnectBlueSkyComponent from 'components/Account Components/ConnectBlueskyComponent.vue';

const $q = useQuasar();

const accounts = useAccountsStore();
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

const newBlueskyAccount = ref<boolean>(false);
const newMastodonAccount = ref<boolean>(false);
const newLemmyAccount = ref<boolean>(false);
const newPixelfedAccount = ref<boolean>(false);
const refreshKey = ref(0);

const isDeleteDialogOpen = ref(false);
const confirmingDelete = ref<number | null>(null);

eventBus.on('close-bluesky-login', () => {
  newBlueskyAccount.value = false;
  refreshKey.value++;
});
eventBus.on('close-mastodon-login', () => {
  newMastodonAccount.value = false;
  refreshKey.value++;
});
eventBus.on('close-lemmy-login', () => {
  newLemmyAccount.value = false;
  refreshKey.value++;
});
eventBus.on('close-pixelfed-login', () => {
  newPixelfedAccount.value = false;
  refreshKey.value++;
});

async function toggleAccount(account: ConnectedAccount) {
  try {
    await accounts.toggleAccountEnabled(account.id);
  } catch (err) {
    console.error(err);
    account.enabled = !account.enabled;
    $q.notify({
      type: 'negative',
      message: 'Failed to update account',
      position: 'top-right',
    })
  }
}

onMounted( async () => {
  await accounts.fetchConnectedAccounts()
})
</script>

<template>
  <q-card class="wrapper">
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
        <q-toggle color="positive" v-model="item.enabled" size="sm" @update:model-value="toggleAccount(item)">
          <q-tooltip>Enable this account by default?</q-tooltip>
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
    <q-card-section>
      <h4>Add New Accounts</h4>
      <div style="display: flex">
        <q-btn label="Mastodon" icon="fa-brands fa-mastodon"  style="color: #5d52e9" flat no-caps
          @click="newMastodonAccount = true"/>
        <q-btn label="Bluesky" icon="fa-brands fa-bluesky" style="color: #1185fe" flat no-caps
          @click="newBlueskyAccount = true"/>
        <q-btn flat no-caps @click="newPixelfedAccount = true">
          <template v-slot:default>
            <q-img src="/icons/pixelfed.svg" style="width: 35px; height: 35px; margin-right: 5px"/>
            Pixelfed
          </template>
        </q-btn>
        <q-btn flat no-caps @click="newLemmyAccount = true">
          <template v-slot:default>
            <q-img src="/icons/lemmy.svg" style="width: 35px; height: 35px; margin-right: 5px"/>
            Lemmy
          </template>
        </q-btn>
      </div>
    </q-card-section>
  </q-card>
  <ConnectBlueSkyComponent v-if="newBlueskyAccount" v-model="newBlueskyAccount" :key="refreshKey" />
  <ConnectMastodonComponent v-if="newMastodonAccount" v-model="newMastodonAccount" :key="refreshKey" />
  <ConnectLemmyComponent v-if="newLemmyAccount" v-model="newLemmyAccount" :key="refreshKey" />
  <ConnectPixelfedComponent v-if="newPixelfedAccount" v-model="newPixelfedAccount" :key="refreshKey" />
</template>

<style scoped>
.wrapper {
  width: 75%;
  margin: 0 auto;
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
  margin-right: 0;
  margin-left: auto;
  padding: 0 1.5rem;
}
</style>
