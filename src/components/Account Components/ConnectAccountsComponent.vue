<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { QExpansionItem } from 'quasar';
import { eventBus } from 'src/tools/event-bus';
import { useAccountsStore } from 'stores';

import ConnectBlueSkyComponent from './ConnectBlueskyComponent.vue';
import ConnectMastodonComponent from 'components/Account Components/ConnectMastodonComponent.vue';
import ConnectLemmyComponent from 'components/Account Components/ConnectLemmyComponent.vue';
import ConnectPixelfedComponent from 'components/Account Components/ConnectPixelfedComponent.vue';

const accounts = useAccountsStore();

type PlatformName = 'mastodon' | 'bluesky' | 'lemmy' | 'pixelfed';
const newBlueskyAccount = ref<boolean>(false);
const newMastodonAccount = ref<boolean>(false);
const newLemmyAccount = ref<boolean>(false);
const newPixelfedAccount = ref<boolean>(false);
const refreshKey = ref(0);

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

const platforms: { name: PlatformName; label: string; icon: string; color: string }[] = [
  {
    name: 'mastodon',
    label: 'Mastodon',
    icon: 'fa-brands fa-mastodon',
    color: '#5d52e9',
  },
  {
    name: 'bluesky',
    label: 'Bluesky',
    icon: 'fa-brands fa-bluesky',
    color: '#1185fe'
  },
  {
    name: 'lemmy',
    label: 'Lemmy',
    icon: '/icons/lemmy.svg',
    color: '#66d7ba',
  },
  {
    name: 'pixelfed',
    label: 'PixelFed',
    icon: '/icons/pixelfed.svg',
    color: '#ffffff',
  },
];

const platformToggles = reactive<Record<PlatformName, boolean>>({
  mastodon: true,
  bluesky: true,
  lemmy: true,
  pixelfed: true,
});

const expansionRefs = reactive<Record<PlatformName, InstanceType<typeof QExpansionItem> | null>>({
  mastodon: null,
  bluesky: null,
  lemmy: null,
  pixelfed: null,
});

const isDeleteDialogOpen = ref(false);
const confirmingDelete = ref<number | null>(null);

function triggerAddNew(platform: string) {
  if (platform === 'mastodon') {
    newMastodonAccount.value = true;
  } else if (platform === 'bluesky') {
    newBlueskyAccount.value = true;
  } else if (platform === 'lemmy') {
    newLemmyAccount.value = true;
  } else if (platform === 'pixelfed') {
    newPixelfedAccount.value = true;
  }
}

function toggleAllForPlatform(platform: PlatformName, value: boolean) {
  if(!accounts.accounts) return;
  platformToggles[platform] = value;

  accounts.accounts
    .filter(account => account.platform === platform)
    .forEach(account => {
      account.enabled = value;
    });

  if(!value) {
    expansionRefs[platform]?.hide();
  } else {
    expansionRefs[platform]?.show();
  }
}

watch(() => accounts.accounts, () => {
  refreshKey.value++;
}, {deep: true});
</script>

<template>
  <q-card v-if="accounts.accounts" class="account-wrapper">
    <q-expansion-item v-for="platform in platforms" :key="platform.name" default-opened
      :ref="(el: InstanceType<typeof QExpansionItem> | null) => expansionRefs[platform.name] = el"
      expand-icon="fa-solid fa-caret-up" hide-icon="fa-solid fa-caret-down">
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon v-if="platform.icon.endsWith('.svg')" :name="'img:' + platform.icon"
                  :style="{color: platform.color}" size="lg" />
          <q-icon v-else :name="platform.icon"
                  :style="{color: platform.color}" size="lg" />
        </q-item-section>
        <q-item-section>
          <h5 class="q-ma-none text-weight-bold">{{ platform.label }}</h5>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="platformToggles[platform.name]"
                    @update:model-value="(val) => toggleAllForPlatform(platform.name, val)"
                    color="primary">
            <q-tooltip>Toggle all {{ platform.label }} accounts?</q-tooltip>
          </q-toggle>
        </q-item-section>
      </template>

      <!--Account Interaction-->
      <q-card-section v-for="(item, index) in accounts.accounts.filter(a => a.platform === platform.name)"
        :key="index" class="card-section" >
        <q-icon name="fa-solid fa-at" :style="'color: ' + platform.color" size="xs" />
        <q-btn :label="item.handle" :href="item.account_url" target="_blank" flat no-caps>
          <q-tooltip>Open this account page</q-tooltip>
        </q-btn>
        <div class="actions">
          <q-toggle color="positive" v-model="item.enabled" size="sm" >
            <q-tooltip>Post to this account?</q-tooltip>
          </q-toggle>
          <q-btn icon="fa-solid fa-trash" color="negative" round flat size="sm"
            @click="confirmingDelete = item.id; isDeleteDialogOpen = true" >
            <q-tooltip>Delete this account?</q-tooltip>
          </q-btn>
        </div>

        <!--Delete Account Dialog-->
        <q-dialog v-model="isDeleteDialogOpen" :persistent="true">
          <q-card>
            <q-card-section class="row items-center">
              <q-icon name="fa-solid fa-triangle-exclamation" color="negative" flat size="lg" class="q-mr-lg" />
              <h4 style="font-size: medium; font-weight: bold">Are you sure you want to disconnect this account?</h4>
            </q-card-section>

            <q-card-actions>
              <q-btn label="Cancel" color="positive" @click="isDeleteDialogOpen = false" class="dialog-btn" />
              <q-btn label="Delete" color="negative" v-close-popup class="dialog-btn"
                @click="accounts.deleteConnectedAccount(confirmingDelete ?? -1); isDeleteDialogOpen = false" />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <!--Delete Account Dialog-->
      </q-card-section>

      <q-btn :label="`Add New ${platform.label} Account`"
        class="submit q-btn-new" color="positive"
        @click="triggerAddNew(platform.name)" size="md" />
    </q-expansion-item>
  </q-card>

  <ConnectBlueSkyComponent v-if="newBlueskyAccount" v-model="newBlueskyAccount" :key="refreshKey" />
  <ConnectMastodonComponent v-if="newMastodonAccount" v-model="newMastodonAccount" :key="refreshKey" />
  <ConnectLemmyComponent v-if="newLemmyAccount" v-model="newLemmyAccount" :key="refreshKey" />
  <ConnectPixelfedComponent v-if="newPixelfedAccount" v-model="newPixelfedAccount" :key="refreshKey" />
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
.q-expansion-item {
  margin-bottom: 1rem;
  text-align: center;
}
.actions {
  display: flex;
  margin-left: auto;
  margin-right: 0;
}
.q-btn {
  font-size: 1rem;
  overflow-x: hidden;
  max-width: 75%;
  margin: auto;
}
.q-btn-new {
  margin-top: 1rem;
}
.dialog-btn {
  padding: 0 1.5rem;
}
</style>
