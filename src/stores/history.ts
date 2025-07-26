import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'
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

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select()
        .eq('user_id', auth.user.id);

      if (postsError) throw postsError;
      this.posts = postsData?.reverse();

      const { data: subPostsData, error: subPostsError } = await supabase
        .from('account_posts')
        .select()
        .eq('user_id', auth.user.id);

      if (subPostsError) throw subPostsError;
      this.sub_posts = subPostsData;
    },

    async init() {
      const authStore = useAuthStore();
      if (authStore.user) {
        await this.fetchPostHistory();
      }
    }
  }
})
