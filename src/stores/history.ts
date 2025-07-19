import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from './auth'
import { type Posts, type AccountPost } from './models';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
