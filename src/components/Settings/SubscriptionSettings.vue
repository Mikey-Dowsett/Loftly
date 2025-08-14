<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore, useSubscriptionStore } from 'stores';
import { useErrorHandling } from 'src/composables/useErrorHandling';
import axios from 'axios';
import { format } from 'date-fns';

const auth = useAuthStore();
const subscription = useSubscriptionStore();
const { handleError } = useErrorHandling();

const loading = ref(false);

// Open Stripe Customer Portal
const openCustomerPortal = async () => {
  loading.value = true;

  try {
    const { data } = await axios.post('http://loftlyapi.fly.dev/create-customer-portal-session', {
      customer_id: subscription.subscription?.stripe_customer_id,
    });

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Failed to get portal URL');
    }
  } catch (err) {
    handleError(err);
  } finally {
    loading.value = false;
  }
};

const subscriptionEndDate = computed(() => {
  const rawDate = subscription.subscription?.subscription_ends_at;
  if (!rawDate) return 'No end date';

  const date = new Date(rawDate); // works for ISO or timestamps
  return format(date, 'PPP'); // e.g., Jan 1, 2025
});
</script>

<template>
  <div v-if="auth.user">
    <h4>
      <q-icon name="fa-solid fa-money-check-dollar" /> Subscription Management
    </h4>

    <q-separator />

    <h5>Current Subscription: {{ subscription.subscription?.plan_name }}
      <q-badge color="accent" text-color="white">
        {{ subscription.subscription?.subscription_status }}
      </q-badge>
    </h5>
    <h5>Renews on: {{ subscriptionEndDate }}</h5>

    <q-btn
      label="Open Customer Portal"
      color="primary"
      class="submit"
      icon="fa-solid fa-arrow-up-right-from-square"
      :loading="loading"
      @click="openCustomerPortal"
    />
  </div>

  <div v-else>
    <q-spinner />
  </div>
</template>

<style scoped>
p {
  margin-bottom: 8px;
}
</style>
