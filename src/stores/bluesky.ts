import { defineStore } from 'pinia'
import { AtpAgent } from '@atproto/api'
import { createClient } from '@supabase/supabase-js'
import { eventBus } from '../tools/event-bus'
import { useAuthStore } from './auth'
import { useAccountsStore } from './accounts'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useBlueskyStore = defineStore('bluesky', {
  state: () => ({
    connecting: false,
  }),

  actions: {
    async connectAccount(handle: string, app_password: string) {
      const auth = useAuthStore();
      if  (!auth.user) return 'Not logged in';

      this.connecting = true;
      const agent = new AtpAgent({ service: 'https://bsky.social' });

      try {
        const loginResult = await agent.login({
          identifier: handle,
          password: app_password,
        });

        const { handle: confirmedHandle } = loginResult.data;

        await supabase.from('linked_accounts').insert({
          user_id: auth.user.id,
          platform: 'bluesky',
          handle: confirmedHandle,
          account_url: `https://bsky.app/profile/${confirmedHandle}`,
          did: agent.session?.did,
          app_password: app_password,
          access_token: agent.session?.accessJwt,
          refresh_token: agent.session?.refreshJwt,
          token_expires_at: null,
        });

        eventBus.emit('close-bluesky-login');

        const connectedAccountsStore = useAccountsStore();
        await connectedAccountsStore.fetchConnectedAccounts();

        return 'Account Connected';
      } catch (e: unknown) {
        if (e instanceof Error) {
          return e.message;
        } else if (typeof e === 'string') {
          return e;
        } else {
          return 'An unknown error occurred. Please try again.';
        }
      } finally {
        this.connecting = false;
      }
    },
  }
})
