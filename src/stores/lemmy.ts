import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js';
import { useAuthStore, useAccountsStore } from './'
import { LemmyHttp, type ListCommunitiesResponse } from 'lemmy-js-client';
import { eventBus } from 'src/tools/event-bus';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useLemmyStore = defineStore('lemmy', {
  state: () => ({
    connecting: false,
    communities: {instance: '', communities: []}
  }),

  actions: {
    async connectAccount(username: string, password: string, tfa: string, instance: string) {
      const auth = useAuthStore();
      if (!auth.user) return 'Not logged in';

      this.connecting = true;

      const cleanInstance = instance.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const baseUrl = `https://${cleanInstance}`;

      const client: LemmyHttp = new LemmyHttp(baseUrl);

      const loginRequest = {
        username_or_email: username,
        password: password,
        ...(tfa && { totp_2fa_token: tfa })
      }

      const response = await client.login(loginRequest);

      if(response.jwt) {
        await supabase.from('linked_accounts').insert({
          user_id: auth.user.id,
          platform: 'lemmy',
          instance: cleanInstance,
          handle: username,
          account_url: `https://${cleanInstance}/u/${username.split('@')[0]}`,
          did: null,
          app_password: null,
          access_token: response.jwt,
          refresh_token: null,
          token_expires_at: null,
        });

        eventBus.emit('close-lemmy-login');

        const connectedAccountsStore = useAccountsStore();
        await connectedAccountsStore.fetchConnectedAccounts();
      } else {
        throw new Error('Login failed: No JWT token received')
      }
      this.connecting = false;
    },

    async searchCommunities(instance: string, query: string, jwt?: string) {
      const auth = useAuthStore();
      if (!auth.user) return null;

      try {
        const baseUrl = `https://${instance}`;

        const client: LemmyHttp = new LemmyHttp(baseUrl);

        if (jwt) {
          client.setHeaders({ Authorization: `Bearer ${jwt}` });
        }

        const searchRequest = {
          q: query,
          type_: 'Communities' as const,
          sort: 'TopAll' as const,
          limit: 50,
          page: 1,
        }

        const response: ListCommunitiesResponse = await client.search(searchRequest);

        return response;
      } catch {
        throw new Error('Could not get communities from listCommunities');
      }
    },
  }
})
