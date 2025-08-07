import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase'
import { useAuthStore, usePlansStore } from 'stores'
import { type Posts, type AccountPost } from './models';

export const useHistoryStore = defineStore('history', {
  state: () => ({
    posts: [] as Posts[],
    sub_posts: [] as AccountPost[],
  }),

  actions: {
    async fetchPostHistory() {
      const auth = useAuthStore();
      if (!auth.user) return;

      const plan = usePlansStore();
      const days = plan.plan?.history_days ?? 30; // Change this to 180 or other values as needed
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select()
        .eq('user_id', auth.user.id)
        .gte('created_at', sinceDate.toISOString());

      if (postsError) throw postsError;
      this.posts = postsData?.reverse();

      const { data: subPostsData, error: subPostsError } = await supabase
        .from('account_posts')
        .select()
        .eq('user_id', auth.user.id);

      if (subPostsError) throw subPostsError;
      this.sub_posts = subPostsData;
    },

    clearHistory() {
      this.posts = [];
      this.sub_posts = [];
    },

    async init() {
      const authStore = useAuthStore();
      if (authStore.user) {
        await this.fetchPostHistory();
      }
    }
  }
})
