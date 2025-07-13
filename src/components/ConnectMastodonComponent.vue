<script setup lang="ts">
import { ref } from 'vue'
import { eventBus } from '../tools/event-bus';
import { useMastodonStore } from 'stores'

const mastodon = useMastodonStore();
const modelValue = defineModel<boolean | null>({ default: false });
const instances = mastodon.getInstances;
const instanceId = ref(0)

function connectAccount() {
  const scope = 'read write';
  const selectedInstance = instances?.at(instanceId.value);
  const redirectUri = 'http://localhost:9000/mastodon/callback'
  console.log(selectedInstance)

  const authUrl = `https://${selectedInstance?.instance}/oauth/authorize` +
    `?client_id=${selectedInstance?.client_key}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${instanceId.value}`;

  console.log("Redirecting to:", authUrl);

  window.location.href = authUrl;
}

function closeWindow() {
  eventBus.emit('close-mastodon-login');
}
</script>

<template>
  <q-dialog v-model="modelValue">
    <q-card>
      <h4 class="q-mt-lg">Connect Mastodon Account</h4>
      <q-form @submit.prevent="connectAccount" autocomplete="off">
        <div style="display: flex;">
        <q-btn-dropdown color="primary" :label="instances.at(instanceId)?.instance">
          <q-list>
            <q-item v-for="(instance, i) in instances" :key="i" clickable v-close-popup @click="instanceId=i">
              <q-item-section>
                <q-item-label>{{ instance.instance }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn type="Submit" label="Connect" class="submit" color="positive" />
        </div>
      </q-form>
      <q-btn icon="fa-solid fa-close" flat round class="close" @click="closeWindow" />
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-btn {
  margin: 0.25rem;
}
</style>
