import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase'
import { type SubscriptionModel } from './models';
import { useAuthStore, usePlansStore } from 'stores'

export const useSubscriptionStore =  defineStore('subscription', {
  state: () => ({
    subscription: null as SubscriptionModel | null,
    loading: false,
  }),

  actions: {
    async fetchSubscription() {
      const auth = useAuthStore();
      if (!auth.user) return;

      this.loading = true;
      const { data, error } = await supabase
        .from('subscriptions')
        .select()
        .eq('user_id', auth.user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        this.loading = false;
        return;
      }

      this.subscription = data;
      this.loading = false;
    },

    async createSubscription() {
      const auth = useAuthStore();
      if (!auth.user) return;

      this.loading = true;
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: auth.user.id,
          plan_name: 'free',
          email: auth.user.email,
        });

      if (error) {
        console.error('Error creating subscription:', error);
        this.loading = false;
        return;
      }

      this.subscription = data;
      this.loading = false;
    },

    async init() {
      const auth = useAuthStore();
      if (!auth.user) return;

      // Fetch existing subscription if it exists
      await this.fetchSubscription();

      // If no subscription exists, create a default one
      if (!this.subscription) {
        await this.createSubscription();
      }

      const plansStore = usePlansStore();
      await plansStore.init();
    }
  }
});
