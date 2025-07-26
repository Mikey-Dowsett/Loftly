import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase'
import { type User, type Session } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    session: null as Session | null,
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
      this.session = session;
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
      await this.fetchUser();
      return true;
    },

    async setSession(access_token: string, refresh_token: string) {
      this.loading = true;
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) throw error;

      this.session = data.session;
      this.user = data.session?.user || null;
      this.loading = false;
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
    },

    async verifyEmailWithCode(email: string, token: string) {
      this.loading = true;
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'signup',
      });

      this.loading = false;

      if (error) throw error;
      this.session = session;

      await this.fetchUser();
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

    async updateUserEmail(newEmail: string,) {
      const { data, error } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: 'http://localhost:9000/email-confirmed'
        }
      );

      if (error) throw error;
      console.log(data);
    },

    async init() {
      this.loading = true;
      await this.fetchUser();
      this.setupAuthListener();
      this.loading = false;
    },
  },
})
