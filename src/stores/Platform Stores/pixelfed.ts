import { defineStore } from 'pinia'
import generator from 'megalodon';
import { supabase } from 'src/lib/supabase'
import { type Instances } from '../models'
import { eventBus } from 'src/tools/event-bus'
import { useAuthStore, useAccountsStore } from 'stores'
import { useErrorHandling } from 'src/composables/useErrorHandling';

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
      const siteUrl = import.meta.env.VITE_URL;

      this.loading = true;
      const { data, error } = await supabase.from('instances')
        .select().eq('platform', 'pixelfed').eq('site_url', siteUrl);
      this.instances = data || [];
      this.loading = false;

      if (error) throw error;
      return this.instances;
    },

    async registerInstance(instance: string) {
      this.loading = true;
      const siteUrl = import.meta.env.VITE_URL;
      const redirectUri = `${siteUrl}/pixelfed/callback`;

      try {
        const client = generator('pixelfed', `https://${instance}`);

        const appData = await client.registerApp('Loftly', {
          scopes: ['read', 'write'],
          redirect_uris: redirectUri,
          website: siteUrl
        });

        const { data, error } = await supabase.from('instances').insert({
          platform: 'pixelfed',
          instance,
          client_key: appData.client_id,
          client_secret: appData.client_secret,
          site_url: siteUrl,
        }).select().single();

        if (error) throw error;
        return data;
      } catch (error) {
        handleError(error);
      } finally {
        this.loading = false;
      }
    },

    async connectAccount(code: string, instanceUrl: string) {
      const auth = useAuthStore();
      if (!auth.user) return;

      if (this.instances.length === 0) {
        await this.fetchInstances();
      }

      const instance = this.instances.find((x) => x.instance === instanceUrl);
      if (!instance) return `Missing instance ${instanceUrl}`;

      this.connecting = true;
      const siteUrl = import.meta.env.VITE_URL;
      const redirectUri = `${siteUrl}/pixelfed/callback`;

      try {
        const client = generator('pixelfed', `https://${instance.instance}`)

        // Get token from auth code
        const tokenData = await client.fetchAccessToken(
          instance.client_key,
          instance.client_secret,
          code,
          redirectUri
        );
        const accessToken = tokenData.access_token;

        const authedClient = generator('pixelfed', `https://${instance.instance}`, accessToken)
        const { data: account } = await authedClient.verifyAccountCredentials()

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

        eventBus.emit('close-pixelfed-login');

        const connectedAccountsStore = useAccountsStore();
        await connectedAccountsStore.fetchConnectedAccounts();

        return 'Account Connected';
      } catch (e: unknown) {
        handleError(e);
        return e;
      } finally {
        this.connecting = false;
      }
    },

    async startAccountConnection(instanceUrl: string) {
      const siteUrl = import.meta.env.VITE_URL;
      try {
        // Ensure instance exists in DB
        let selectedInstance = this.instances.find((x) => x.instance === instanceUrl);
        if (!selectedInstance) {
          // Register instance and get fresh inserted row immediately
          const newInstance = await this.registerInstance(instanceUrl);
          if (!newInstance) throw new Error('Failed to register instance');

          // Update local instances list and use the new instance directly
          this.instances.push(newInstance);
          selectedInstance = newInstance;
        }

        if (!selectedInstance) {
          throw new Error('Instance not found. Try refreshing the page');
        }
        this.loading = true;

        const redirectUri = `${siteUrl}/pixelfed/callback`;
        const scope = 'read write';

        // Build the authorization URL using Megalodon helper
        const authUrl =
          `https://${instanceUrl}/oauth/authorize` +
          `?client_id=${encodeURIComponent(selectedInstance.client_key)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scope)}` +
          `&state=${encodeURIComponent(instanceUrl)}`;

        console.log('Redirecting to Pixelfed:', authUrl);

        // Redirect user to Pixelfed
        window.location.href = authUrl;
      } catch (error) {
        handleError(error)
      } finally {
        this.loading = false;
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
