import { defineStore } from 'pinia'
import { supabase } from 'src/lib/supabase'
import { type Instances } from '../models'
import { eventBus } from 'src/tools/event-bus'
import { useAuthStore, useAccountsStore } from 'stores'
import { useErrorHandling } from 'src/composables/useErrorHandling';

const { handleError } = useErrorHandling();

export const useMastodonStore = defineStore('mastodon', {
  state: () => ({
    instances: [] as Instances[],
    connecting: false,
    loading: false,
  }),

  getters: {
    getInstances: (state) => state.instances,
  },

  actions: {
    async fetchInstances() {
      const auth = useAuthStore();
      if (!auth.user) return;

      this.loading = true;
      const { data, error } = await supabase.from('instances')
        .select().eq('platform', 'mastodon');
      this.instances = data || [];
      this.loading = false;

      if (error) throw error;
      return this.instances;
    },

    async registerInstance(instance: string) {
      const redirectUri = 'http://localhost:9000/mastodon/callback';

      try {
        const response = await fetch(`https://${instance}/api/v1/apps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_name: 'Loftly',
            redirect_uris: redirectUri,
            scopes: 'read write',
            website: 'http://localhost:9000',
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to register app: ${response.statusText}`);
        }

        const instanceData = await response.json();

        await supabase.from('instances').insert({
          platform: 'mastodon',
          instance,
          client_key: instanceData.client_id,
          client_secret: instanceData.client_secret,
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        await this.fetchInstances();
      } catch (error) {
        handleError(error);
      }
    },

    async connectAccount(code: string, instanceUrl: string) {
      const auth = useAuthStore();
      if (!auth.user) return 'Not logged in';

      if (this.instances.length === 0) {
        await this.fetchInstances();
      }

      this.connecting = true;
      const redirectUri = 'http://localhost:9000/mastodon/callback';
      const instance = this.instances.find((x: Instances) => x.instance === instanceUrl);

      if(!instance) return `Missing instance ${instance}`;

      try {
        // Exchange auth code for access token
        const tokenResponse = await fetch(`https://${instance.instance}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: instance.client_key,
            client_secret: instance.client_secret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
          }).toString(),
        });

        if (!tokenResponse.ok) {
          const err = await tokenResponse.text();
          return `Token exchange failed: ${err}`;
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch user's account info
        const accountResponse = await fetch(`https://${instance.instance}/api/v1/accounts/verify_credentials`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!accountResponse.ok) {
          const err = await accountResponse.text();
          return `Failed to fetch account: ${err}`;
        }

        const account = await accountResponse.json();
        const handle = `${account.username}@${new URL(`https://${instance.instance}`).hostname}`;

        await supabase.from('linked_accounts').insert({
          user_id: auth.user.id,
          platform: 'mastodon',
          instance: instance.instance,
          handle: handle,
          account_url: account.url,
          did: null,
          app_password: null,
          access_token: accessToken,
          refresh_token: null,
          token_expires_at: null,
        });

        eventBus.emit('close-mastodon-login');

        const connectedAccountsStore = useAccountsStore();
        await connectedAccountsStore.fetchConnectedAccounts();

        return 'Account Connected';
      } catch (e: unknown) {
        if (e instanceof Error) return e.message;
        if (typeof e === 'string') return e;
        return 'An unknown error occurred.';
      } finally {
        this.connecting = false;
      }
    },

    async init() {
      const auth = useAuthStore();
      if(auth.user) {
        await this.fetchInstances();
      }
    }
  }
})
