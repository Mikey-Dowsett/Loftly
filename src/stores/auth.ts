// import { ref } from "vue";
import { defineStore } from 'pinia'
import { createClient, type User } from '@supabase/supabase-js'
import { AtpAgent } from '@atproto/api';
import { type ConnectedAccount } from "stores/models";
import { eventBus } from '../tools/event-bus'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | User,
    connected_accounts: null as null | ConnectedAccount[],
    loading: false,
  }),
  actions: {
    //User Functions
    async fetchUser() {
      this.loading = true;
      const { data: { session }, error } = await supabase.auth.getSession();
      this.user = session?.user || null;
      this.loading = false;

      if (error) throw error;
    },

    // --- Start of connected account functions ---
    async fetchConnectedAccounts() {
      if (!this.user) return;
      const { data, error } = await supabase
        .from('linked_accounts')
        .select()
        .eq('user_id', this.user.id);
      this.connected_accounts = (data || []).map(account => ({
        ...account,
        enabled: true // or false, or something derived
      }));

      if (error) throw error;
      return true;
    },
    async deleteConnectedAccount(id: number) {
      if(!this.user) return;
      const { error } = await supabase.from('linked_accounts')
        .delete().eq('id', id);
      await this.fetchConnectedAccounts();
      if (error) throw error;
      return true;
    },
    async connectBlueskyAccount(handle: string, app_password: string) {
      if  (!this.user) return 'Not logged in';
      const agent = new AtpAgent({ service: 'https://bsky.social' });

      try {
        const loginResult = await agent.login({
          identifier: handle,
          password: app_password,
        });

        //Extract user info
        const { handle: confirmedHandle } = loginResult.data;

        await supabase.from('linked_accounts').insert({
          user_id: this.user.id,
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
        await this.fetchConnectedAccounts();
        return 'Account Connected';
      } catch (e: unknown) {
        if (e instanceof Error) {
          return e.message;
        } else if (typeof e === 'string') {
          return e;
        } else {
          return 'An unknown error occurred. Please try again.';
        }
      }
    },
    // --- End of connected account functions ---
    //CFG -- iaba-iohu-cky5-nqiw

    //Init
    async init() {
      this.loading = true;
      await this.fetchUser();
      if (this.user) await this.fetchConnectedAccounts();
      this.loading = false;

      //Setup Supabase auth state listener
      supabase.auth.onAuthStateChange(async (_event, session) => {
        this.user = session?.user || null;
        if (this.user) {
          await this.fetchConnectedAccounts();
        } else {
          this.connected_accounts = null;
        }
      })
    },

    //Sign in (email + password)
    async signInWithEmail(email: string, password: string) {
      this.loading = true;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      this.loading = false;
      if (error) throw error;
    },

    //Sign out
    async signOut() {
      this.loading = true;
      await supabase.auth.signOut();
      this.user = null;
      this.connected_accounts = null;
      this.loading = false;
    },
  },
})
