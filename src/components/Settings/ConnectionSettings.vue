<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { eventBus } from 'src/tools/event-bus';
import { useAccountsStore, usePlansStore } from 'stores';
import { Platform, type ConnectedAccount } from 'src/stores/models';

import ConnectLemmyComponent from 'components/Connections/ConnectLemmyComponent.vue';
import ConnectPixelfedComponent from 'components/Connections/ConnectPixelfedComponent.vue';
import ConnectMastodonComponent from 'components/Connections/ConnectMastodonComponent.vue';
import ConnectBlueSkyComponent from 'components/Connections/ConnectBlueskyComponent.vue';
import { useErrorHandling } from 'src/composables/useErrorHandling';

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

const newBlueskyAccount = ref<boolean>(false);
const newMastodonAccount = ref<boolean>(false);
const newLemmyAccount = ref<boolean>(false);
const newPixelfedAccount = ref<boolean>(false);
const { handleError } = useErrorHandling();

const refreshKey = ref(0);
const isDeleteDialogOpen = ref(false);
const confirmingDelete = ref<number | null>(null);
const maxAccounts = computed(() => {
  const limit = plan.plan?.account_limit;
  const current = accounts.accounts?.length || 0;
  return limit !== null && limit !== undefined && current >= limit;
});

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
    handleError('Failed to update account');
  }
}

onMounted(async () => {
  await accounts.fetchConnectedAccounts();
});
</script>

<template>
  <div>
    <div class="header">
      <div class="stats">
        <h4>
          Connected: {{ accounts.accounts?.length }}
        </h4>
        <h4>
          Enabled: {{ accounts.enabledAccounts.length }}
        </h4>
        <h4>
          Max: {{ plan.plan?.account_limit }}
        </h4>
      </div>
    </div>

    <div class="add_buttons">
      <q-btn
        label="Mastodon"
        icon="fa-brands fa-mastodon"
        style="color: #5d52e9"
        flat
        no-caps
        @click="newMastodonAccount = true"
        :disable="maxAccounts"
      />
      <q-btn
        label="Bluesky"
        icon="fa-brands fa-bluesky"
        style="color: #1185fe"
        flat
        no-caps
        @click="newBlueskyAccount = true"
        :disable="maxAccounts"
      />
      <q-btn flat no-caps @click="newPixelfedAccount = true" :disable="maxAccounts">
        <template v-slot:default>
          <q-img src="/icons/pixelfed.svg" style="width: 35px; height: 35px; margin-right: 5px" />
          Pixelfed
        </template>
      </q-btn>
      <q-btn flat no-caps @click="newLemmyAccount = true" :disable="maxAccounts">
        <template v-slot:default>
          <q-img src="/icons/lemmy.svg" style="width: 35px; height: 35px; margin-right: 5px" />
          Lemmy
        </template>
      </q-btn>
    </div>
    <q-tooltip v-if="maxAccounts"> Upgrade your plan to add more accounts </q-tooltip>
  </div>

  <q-separator />

  <!--Account Interaction-->
  <q-card-section
    v-for="(item, index) in accounts.accounts"
    :key="index"
    class="card-section"
    :class="index % 2 === 0 ? 'row-even' : 'row-odd'"
  >
    <div class="platform-handle">
      <template
        v-if="(platforms.find((x) => x.name === item.platform)?.icon || '').startsWith('/icons/')"
      >
        <q-img
          :src="platforms.find((x) => x.name === item.platform)?.icon"
          style="width: 40px; height: 40px"
        />
      </template>
      <template v-else>
        <q-icon
          :name="platforms.find((x) => x.name === item.platform)?.icon"
          size="md"
          :style="'color:' + platforms.find((x) => x.name === item.platform)?.color"
        />
      </template>
      <q-btn
        :label="item.handle"
        :href="item.account_url"
        target="_blank"
        flat
        no-caps
        style="margin-left: 0; margin-right: auto"
       />
    </div>
    <div class="actions">
      <q-toggle
        color="positive"
        v-model="item.enabled"
        name="enabled"
        size="md"
        @update:model-value="toggleAccount(item)"
        :disable="!item.enabled && accounts.enabledAccounts.length === plan.plan?.account_limit"
      >
        <q-tooltip v-if="!item.enabled && accounts.enabledAccounts.length === plan.plan?.account_limit"
          >Upgrade your plan to enable more than {{ plan.plan?.account_limit }} accounts</q-tooltip
        >
      </q-toggle>
      <q-separator vertical class="visible-separator gt-xs" />
      <q-btn
        icon="fa-solid fa-trash"
        color="negative"
        round
        flat
        size="md"
        @click="
          confirmingDelete = item.id;
          isDeleteDialogOpen = true;
        "
        class="delete"
       />
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

  <ConnectBlueSkyComponent v-if="newBlueskyAccount" v-model="newBlueskyAccount" :key="refreshKey" />
  <ConnectMastodonComponent
    v-if="newMastodonAccount"
    v-model="newMastodonAccount"
    :key="refreshKey"
  />
  <ConnectLemmyComponent v-if="newLemmyAccount" v-model="newLemmyAccount" :key="refreshKey" />
  <ConnectPixelfedComponent
    v-if="newPixelfedAccount"
    v-model="newPixelfedAccount"
    :key="refreshKey"
  />
</template>

<style scoped>
.header {
  display: flex;
}
.stats {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.add_buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.card-section {
  display: flex;
  align-items: center;
}
.row-even {
  background-color: var(--q-background);
}
.row-odd {
  background-color: var(--q-background-accent);
}
.visible-separator {
  height: 24px;
  margin: auto 5px;
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

@media (max-width: 600px) {
  .header {
    display: inline;
  }
  .header h4 {
    font-size: 1.5rem;
  }
  .stats {
    display: inline;
  }

  .card-section {
    display: block;
  }

  .platform-handle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .delete {
    margin-left: auto;
    margin-right: 0;
  }
}
</style>
