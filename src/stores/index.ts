import { defineStore } from '#q-app/wrappers'
import { createPinia } from 'pinia'
import { useAuthStore } from './auth'
import { useSubscriptionStore } from './subscription'
import { usePlansStore } from './plans'
import { useUsageStore } from './usage'
import { useStorageStore } from './storage'
import { useAccountsStore } from './accounts'
import { useHistoryStore } from './history'

import { useMastodonStore } from './Platform Stores/mastodon'
import { useBlueskyStore } from './Platform Stores/bluesky';
import { useLemmyStore } from './Platform Stores/lemmy'
import { usePixelfedStore} from './Platform Stores/pixelfed';

export async function initializeStores() {
  const authStore = useAuthStore();
  const subscriptionStore = useSubscriptionStore();
  const plansStore = usePlansStore();
  const usageStore = useUsageStore();
  const connectedAccountsStore = useAccountsStore();
  const historyStore = useHistoryStore();

  const mastodonStore = useMastodonStore();
  const pixelfedStore = usePixelfedStore();

  // Initialize auth first
  await authStore.init();

  // Initialize other stores if user is authenticated
  if (authStore.user) {
    console.log("Initializing user store");
    await Promise.all([
      connectedAccountsStore.init(),
      subscriptionStore.init(),
      plansStore.init(),
      usageStore.init(),
      historyStore.init(),
      mastodonStore.init(),
      pixelfedStore.init(),
    ]);
  }
}

export {
  useAuthStore,
  useSubscriptionStore,
  usePlansStore,
  useUsageStore,
  useStorageStore,
  useAccountsStore,
  useHistoryStore,

  useMastodonStore,
  useBlueskyStore,
  useLemmyStore,
  usePixelfedStore,
}

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PiniaCustomProperties {
    // add your custom properties here, if any
  }
}

export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia()

  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  return pinia
});
