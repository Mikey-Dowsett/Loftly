import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase'
import { type Plans } from './models';
import { useAuthStore, useSubscriptionStore } from 'stores'

export const usePlansStore = defineStore('plans', {
  state: () => ({
    plan: null as Plans | null,
    loading: false,
  }),

  actions: {
    async fetchPlan() {
      const auth = useAuthStore();
      if (!auth.user) return;
      const subscription = useSubscriptionStore();

      this.loading = true;
      const { data, error } = await supabase
        .from('plans')
        .select()
        .eq('name', subscription.subscription?.plan_name || 'free')
        .single();

      if (error) {
        console.error('Error fetching plan:', error);
        this.loading = false;
        return;
      }

      this.plan = data;
      this.loading = false;
    },

    clearPlan() {
      this.plan = null;
    },

    async init() {
      const authStore = useAuthStore();
      if (authStore.user) {
        await this.fetchPlan();
      }
    }
  }
});
