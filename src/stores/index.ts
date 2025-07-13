import { defineStore } from '#q-app/wrappers'
import { createPinia } from 'pinia'
import { useAuthStore } from './auth'
import { useAccountsStore } from './accounts'
import { useMastodonStore } from './mastodon'
import { useBlueskyStore } from 'stores/bluesky';

export async function initializeStores() {
  const authStore = useAuthStore();
  const connectedAccountsStore = useAccountsStore();
  const mastodonStore = useMastodonStore();

  // Initialize auth first
  await authStore.init();

  // Initialize other stores if user is authenticated
  if (authStore.user) {
    await Promise.all([
      connectedAccountsStore.init(),
      mastodonStore.init(),
    ]);
  }
}

export {
  useAuthStore,
  useAccountsStore,
  useMastodonStore,
  useBlueskyStore,
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
