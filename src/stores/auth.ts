import { defineStore } from 'pinia'
import { createClient, type User } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | User,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userId: (state) => state.user?.id,
  },

  actions: {
    async fetchUser() {
      this.loading = true;
      const { data: { session }, error } = await supabase.auth.getSession();
      this.user = session?.user || null;
      this.loading = false;

      if (error) throw error;
      return true;
    },

    async signInWithEmail(email: string, password: string) {
      this.loading = true;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      this.loading = false;

      if (error) throw error;
      return true;
    },

    async signOut() {
      this.loading = true;
      await supabase.auth.signOut();
      this.user = null;
      this.loading = false;

      window.location.href = "/";
    },

    async signUpWithEmail(email: string, password: string) {
      this.loading = true;
      const { error } = await supabase.auth.signUp({ email, password });
      this.loading = false;
      if (error) throw error;

      //Create user folder in photos
      if(!this.user) return;
      await this.createUserStorageFolders();
    },

    async createUserStorageFolders() {
      if (!this.user) return;

      const initBlob = new Blob(['Initialized']);

      await Promise.all([
        supabase.storage
          .from('images')
          .upload(`${this.user.id}/.init`, initBlob, {
            upsert: false,
            contentType: 'image/*',
          }),
        supabase.storage
          .from('videos')
          .upload(`${this.user.id}/.init`, initBlob, {
            upsert: false,
            contentType: 'video/*',
          }),
      ]);
    },

    setupAuthListener() {
      supabase.auth.onAuthStateChange(async (_event, session) => {
        this.user = session?.user || null;

        // Trigger other stores to update when auth state changes
        if (this.user) {
          const { useAccountsStore } = await import('./accounts');
          const connectedAccountsStore = useAccountsStore();
          await connectedAccountsStore.fetchConnectedAccounts();
        } else {
          const { useAccountsStore } = await import('./accounts');
          const connectedAccountsStore = useAccountsStore();
          connectedAccountsStore.clearAccounts();
        }
      });
    },

    async init() {
      this.loading = true;
      await this.fetchUser();
      this.setupAuthListener();
      this.loading = false;
    },
  },
})
