<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore, useSubscriptionStore } from 'stores';
import { PlanTiers } from 'stores/models'
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
      window.open(data.url, "_blank");
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
    <div class="subscription-info">
      <div class="info-row">
        <h4 class="info-label">Current Plan:</h4>
        <div class="info-value text-h6">
          {{ subscription.subscription?.plan_name }}
          <q-badge
            color="accent"
            text-color="white"
            class="status-badge"
          >
            {{ subscription.subscription?.subscription_status }}
          </q-badge>
        </div>
      </div>
    </div>
    <div class="info-row">
      <h4 class="info-label">Renews on:</h4>
      <div class="info-value text-h6">{{ subscriptionEndDate }}</div>
    </div>

    <q-btn
      label="Open Customer Portal"
      color="primary"
      class="submit"
      icon="fa-solid fa-arrow-up-right-from-square"
      :loading="loading"
      @click="openCustomerPortal"
      v-if="subscription.subscription?.plan_name != PlanTiers.free"
    />
  </div>

  <div v-else class="loader">
    <q-spinner />
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.subscription-info {
  margin: 1.5rem 0;
}

.info-row {
  margin-bottom: 1rem;
}

.info-label {
  margin: 0;
  font-weight: 500;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.status-badge {
  font-size: 0.8rem;
}

.loader {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

@media (max-width: 600px) {
  .header {
    font-size: 1.25rem;
  }
}
</style>
