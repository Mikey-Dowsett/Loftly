import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase'
import { type UsageModel } from './models';
import { useAuthStore } from 'stores'

export const useUsageStore = defineStore('usage', {
  state: () => ({
    usage: null as UsageModel | null,
    loading: false,
  }),

  actions: {
    async fetchUsage() {
      const auth = useAuthStore();
      if (!auth.user) return;

      this.loading = true;
      const { data, error } = await supabase
        .from('usage_tracking')
        .select()
        .eq('user_id', auth.user.id)
        .single();

      if (error) throw error;

      this.usage = data;
      console.log('Fetched usage:', this.usage);
      this.loading = false;
    },

    async updateUsage(pc: number = 0, aic: number = 0) {
      const auth = useAuthStore();
      if (!auth.user) return;

      this.loading = true;

      const { error } = await supabase.rpc('increment_usage', {
        uid: auth.user.id,
        pc,
        aic,
      });

      if (error) throw error;

      await this.fetchUsage();
      this.loading = false;
    },

    async init() {
      const auth = useAuthStore();
      if (!auth.user) return;

      await this.fetchUsage();
    },
  },
});
