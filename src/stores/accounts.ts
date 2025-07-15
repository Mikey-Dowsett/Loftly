import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js'
import { type ConnectedAccount } from './models';
import { useAuthStore } from './auth'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as ConnectedAccount[],
    loading: false,
  }),

  getters: {
    enabledAccounts: (state) => state.accounts.filter(account => account.enabled),
    accountsByPlatform: (state) => {
      return state.accounts.reduce((acc, account) => {
        if (!acc[account.platform]) acc[account.platform] = [];
        acc[account.platform]?.push(account);
        return acc;
      }, {} as Record<string, ConnectedAccount[]>);
    },
  },

  actions: {
    async fetchConnectedAccounts() {
      const auth = useAuthStore();
      if (!auth.user) return;

      const { data, error } = await supabase
        .from('linked_accounts')
        .select()
        .eq('user_id', auth.user.id);

      this.accounts = (data || []).map(account => ({
        ...account,
        enabled: true, // or false, or something derived
        lemmy_communities: [],
      }));

      this.loading = false;
      if (error) throw error;
      return true;
    },

    async deleteConnectedAccount(id: number) {
      const auth = useAuthStore();
      if(!auth.user) return;

      const { error } = await supabase
        .from('linked_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await this.fetchConnectedAccounts();
      return true;
    },

    toggleAccountEnabled(id: number) {
      const account = this.accounts.find(acc => acc.id === id);
      if (account) {
        account.enabled = !account.enabled;
      }
    },

    clearAccounts() {
      this.accounts = [];
    },

    async init() {
      const authStore = useAuthStore();
      if (authStore.user) {
        await this.fetchConnectedAccounts();
      }
    },
  }
});
