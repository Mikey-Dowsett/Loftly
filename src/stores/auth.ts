import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase'
import { type User, type Session } from '@supabase/supabase-js';
import { useErrorHandling } from '../composables/useErrorHandling';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    session: null as Session | null,
    loading: false,
    updating: false,
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

    async setupAuthListener() {
      const { useAccountsStore } = await import('./accounts');
      const { useHistoryStore } = await import('./history');
      const { usePlansStore } = await import('./plans');
      const { useSubscriptionStore } = await import('./subscription');
      const { useUsageStore } = await import('./usage');

      const connectedAccountsStore = useAccountsStore();
      const historyStore = useHistoryStore();
      const plansStore = usePlansStore();
      const subscriptionsStore = useSubscriptionStore();
      const usageStore = useUsageStore();

      const lastUserId = this.user?.id;

      supabase.auth.onAuthStateChange((_event, session) => {
        const newUserId = session?.user?.id;
        if (this.updating || newUserId === lastUserId) return;
        this.user = session?.user || null;

        void (async () => {
          if (this.user) {
            await Promise.allSettled([
              connectedAccountsStore.init(),
              historyStore.init(),
              plansStore.init(),
              subscriptionsStore.init(),
              usageStore.init()
            ]);
          } else {
            connectedAccountsStore.clearAccounts();
            historyStore.clearHistory();
            plansStore.clearPlan();
            subscriptionsStore.clearSubscription();
            usageStore.clearUsage();
          }
        })();
      });
    },

    async updateUserEmail(newEmail: string,) {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: 'http://localhost:9000/email-confirmed'
        }
      );

      if (error) throw error;
    },

    async updateUserPassword(password: string) {
      if(!this.user) return;
      this.updating = true;
      const { handleError } = useErrorHandling();

      try {
        console.log("Updating user password...");
        const { error } = await supabase.auth.updateUser({
          password: password,
        });
        console.log("User password updated!");

        if (error) throw error;
      } catch (error) {
        handleError(error);
      } finally {
        this.updating = false;
      }
    },

    async init() {
      this.loading = true;
      await this.fetchUser();
      await this.setupAuthListener();
      this.loading = false;
    },
  },
})
