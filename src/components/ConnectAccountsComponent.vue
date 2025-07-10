<script setup lang="ts">
import ConnectBlueSkyComponent from './ConnectBlueskyComponent.vue';
import { ref } from 'vue';
import { eventBus } from '../tools/event-bus'
import { useAuthStore } from 'stores/auth'

const auth = useAuthStore()

const newBlueskyAccount = ref<boolean>(false);
const confirmDialog = ref<boolean>(false);
const refreshKey = ref(0);

eventBus.on('close-bluesky-login', () => {
  newBlueskyAccount.value = false;
  refreshKey.value++;
});
</script>

<template>
  <q-card v-if="auth.connected_accounts">
    <!--    Bluesky Card   -->
    <q-expansion-item icon="fa-brands fa-bluesky" default-opened label="Bluesky" header-style="color: #1185fe; font-weight: bold;">
      <q-card-section v-for="(item, index) in auth.connected_accounts.filter(a => a.platform === 'bluesky')"
                      :key="index" class="card-section">
        <q-icon name="fa-solid fa-at" />
        <q-btn :label=item.handle :href="item.account_url" target="_blank" flat no-caps />
        <div class="actions">
          <q-toggle color="positive" checked-icon="fa-solid fa-check" unchecked-icon="fa-solid fa-xmark"
                     v-model="item.enabled" />
          <q-btn icon="fa-solid fa-trash" color="negative" class="delete-button" round flat size="md"
                 @click="confirmDialog = true" />
        </div>

        <q-dialog v-model="confirmDialog" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-icon name="fa-solid fa-triangle-exclamation" color="negative" flat size="lg" />
              <h4 style="font-size: medium">Are you sure you want to disconnect this account?</h4>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="positive" @click="confirmDialog = false" />
              <q-btn flat label="Delete" color="negative" @click="auth.deleteConnectedAccount(item.id)" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-card-section>
      <q-btn label="Add New Account" class="submit" color="positive" @click="newBlueskyAccount=true"/>
    </q-expansion-item>

  </q-card>

  <ConnectBlueSkyComponent v-if="newBlueskyAccount" v-model="newBlueskyAccount" :key="refreshKey" />
</template>

<style scoped>
.q-card {
  max-width: 40%;
  padding: 1rem;
  margin: 3rem auto;
  overflow-y: auto;
}
.q-icon {
  margin-right: 1rem;
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
  font-size: 1.25rem;
}
</style>
