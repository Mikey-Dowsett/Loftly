import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'
import { type Instances } from './models'
import { eventBus } from '../tools/event-bus'
import { useAuthStore } from './auth'
import { useAccountsStore } from './accounts'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      const authStore = useAuthStore();
      if (!authStore.user) return;

      this.loading = true;
      const { data, error } = await supabase.from('instances').select().eq('platform', 'mastodon');
      this.instances = data || [];
      this.loading = false;

      if (error) throw error;
    },

    async connectAccount(code: string, instanceId: number) {
      const auth = useAuthStore();
      if (!auth.user) return 'Not logged in';

      if (this.instances.length === 0) {
        await this.fetchInstances();
      }

      this.connecting = true;
      const redirectUri = 'http://localhost:9000/mastodon/callback';
      const instance = this.instances.at(instanceId);
      console.log('instance', instance, 'instanceId', instanceId);

      if(!instance) return `Missing instance ${instanceId}`;

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
          handle: handle,
          account_url: account.url,
          did: null,
          app_password: null,
          access_token: accessToken,
          refresh_token: null,
          token_expires_at: null,
          instance: instance.instance,
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
