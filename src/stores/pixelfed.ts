import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'
import { type Instances } from './models'
import { eventBus } from '../tools/event-bus'
import { useAuthStore, useAccountsStore } from '.'
import { useErrorHandling } from 'src/composables/useErrorHandling';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const { handleError } = useErrorHandling();

export const usePixelfedStore = defineStore('pixelfed', {
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
        .select().eq('platform', 'pixelfed');
      this.instances = data || [];
      this.loading = false;

      if (error) throw error;
    },

    async registerInstance(instance: string) {
      const redirectUri = 'http://localhost:9000/pixelfed/callback';

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

        const data = await response.json();

        console.log('Storing Instance', data);
        await supabase.from('instances').insert({
          platform: 'pixelfed',
          instance,
          client_key: data.client_id,
          client_secret: data.client_secret,
        });

        await this.fetchInstances();
      } catch (error) {
        handleError(error);
      }
    },

    async connectAccount(code: string, instanceUrl: string) {
      const auth = useAuthStore();
      if (!auth.user) return;

      this.connecting = true;
      const redirectUri = 'http://localhost:9000/pixelfed/callback';
      const instance = this.instances.find((x: Instances) => x.instance === instanceUrl);

      if(!instance) return `Missing instance ${instance}`;

      try {
        const tokenResponse = await fetch(`https://${instanceUrl}/oauth/token`, {
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

        await supabase.from('linked_accounts').insert({
          user_id: auth.user.id,
          platform: 'pixelfed',
          instance: instance.instance,
          handle: account.username,
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
      if (auth.user) {
        await this.fetchInstances();
      }
    }
  }
});
