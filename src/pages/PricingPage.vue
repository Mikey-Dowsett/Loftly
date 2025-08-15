<script setup lang="ts">
import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthStore, useSubscriptionStore } from 'stores';
import { useErrorHandling} from 'src/composables/useErrorHandling';
import axios from 'axios';
import { PlanNameToEnum, PlanTiers } from 'stores/models';

const auth = useAuthStore();
const subscription = useSubscriptionStore();
const { handleError } = useErrorHandling();
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const apiUrl = import.meta.env.VITE_API_URL;

const redirectToCheckout = async (plan: string, price_id: string) => {
  const stripe = await stripePromise;

  if(PlanNameToEnum[subscription.subscription?.plan_name ?? ''] === PlanTiers.free) {
    const res = await fetch(`${apiUrl}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan: plan, price_id: price_id, user_id: auth.user?.id }),
    });

    const session = await res.json();
    console.log(session);

    const result = await stripe?.redirectToCheckout({
      sessionId: session.id,
    });

    if (result?.error) {
      console.error(result.error.message);
    }
  } else {
    try {
      const { data } = await axios.post(`${apiUrl}/create-customer-portal-session`, {
        customer_id: subscription.subscription?.stripe_customer_id,
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get portal URL');
      }
    } catch (err) {
      handleError(err);
    }
  }
}

const navigateToPost = () => {
  window.location.href = '/post';
};

const annual = ref(false);

const getPrice = (basePrice: number, isAnnual: boolean) => {
  return isAnnual ? basePrice * 0.8 : basePrice;
};

const plans = [
  {
    name: 'Starter Tier',
    price_id: 'null',
    price_id_yearly: 'null',
    price: 0,
    description: 'Get started effortlessly with all the essentials to manage your social media presence',
    features: [
      { text: 'Up to 3 connected accounts', status: 'available' },
      { text: '5 posts per week', status: 'available' },
      { text: 'All Open-Source platforms', status: 'available' },
      { text: 'Create text & image posts', status: 'available' },
      { text: 'Basic post history (30 days)', status: 'available' },
    ],
  },
  {
    name: 'Indie Tier',
    price_id: 'price_1Ro3epDnWFQHUjwgpTi2hP5P',
    price_id_yearly: 'price_1Ro63ADnWFQHUjwghdWjvUJH',
    price: 10,
    popular: true,
    description: 'Take your social presence up a notch with more reach and smarter tools',
    features: [
      { text: 'Up to 10 connected accounts', status: 'available' },
      { text: '25 posts per week', status: 'available' },
      { text: 'Video uploads (100MB)', status: 'coming-soon' },
      { text: 'Schedule posts (30 days)', status: 'coming-soon' },
      { text: 'Basic Analytics Dashboard', status: 'coming-soon' },
      { text: 'Extended history (6 Months)', status: 'available' },
    ],
  },
  {
    name: 'Creator Tier',
    price_id: 'price_1Ro4WwDnWFQHUjwgRP6kgFea',
    price_id_yearly: 'price_1RqyEGDnWFQHUjwgxJIFjFm0',
    price: 25,
    description: 'Maximize your impact with professional-grade tools built for serious creators',
    features: [
      { text: 'Up to 25 connected accounts', status: 'available' },
      { text: '100 posts per week', status: 'available' },
      { text: 'Schedule Posts (6 Months)', status: 'coming-soon' },
      { text: 'Advanced Analytics Dashboard', status: 'coming-soon' },
      { text: 'Extended history (1 year)', status: 'available' },
      { text: 'Custom messages per platform', status: 'coming-soon' },
    ],
  },
];
</script>

<template>
  <q-card class="header-card">
    <h3>Choose Your Plan</h3>
    <p>Start with our free tier and scale up as your needs grow</p>
    <q-toggle v-model="annual" label="Annual Billing" color="primary" left-label />
  </q-card>

  <!-- Pricing Cards -->
  <div class="pricing-cards">
    <div v-for="plan in plans" :key="plan.name" class="pricing-card">
      <q-card :class="{ 'popular-plan': plan.popular }" flat bordered>
        <q-card-section>
          <h4>{{ plan.name }}</h4>
          <h5>
            ${{ getPrice(plan.price, annual )}}<span class="text-subtitle2">/month</span>
          </h5>
          <p class="text-subtitle2">{{ plan.description }}</p>
          <q-btn
            v-if="auth.user"
            :color="plan.popular ? 'primary' : 'grey'"
            :label="plan.price === 0 ? 'Get Started' : 'Subscribe Now'"
            class="full-width"
            @click="
              plan.price === 0
                ? navigateToPost()
                : redirectToCheckout(plan.name, annual ? plan.price_id_yearly : plan.price_id)
            "
            :flat="!plan.popular"
            :text-color="plan.popular ? 'black' : 'primary'"
          />
          <q-btn
            v-else
            :color="plan.popular ? 'primary' : 'grey'"
            label="Login to Subscribe"
            class="full-width"
            :flat="!plan.popular"
            :text-color="plan.popular ? 'black' : 'primary'"
            to="/signup"
          />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h6 class="q-mb-sm q-mt-none">Plan includes:</h6>
          <q-list dense separator>
            <q-item v-for="feature in plan.features" :key="feature">
              <q-item-section avatar>
                <q-icon
                  :name="feature.status === 'available' ? 'fa-solid fa-check' : 'fa-solid fa-hammer'"
                  :color="feature.status === 'available' ? 'positive' : 'warning'"
                />
              </q-item-section>
              <q-item-section>
                {{ feature.text }}
                <q-badge v-if="feature.status === 'coming-soon'" color="warning" text-color="black">
                  Coming Soon
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.header-card {
  text-align: center;
  width: 50%;
  margin: 3rem auto
}

.pricing-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 2rem;
}

.pricing-card {
  width: 30%;
  margin: 0 auto;
}

.popular-plan {
  transform: scale(1.05);
  border: 2px solid var(--q-primary);
}

@media (max-width: 1024px) {
  .header-card {
    width: 90%;
    margin: 1rem auto;
  }
  .pricing-cards {
    display: inline;
  }
  .pricing-card {
    width: 90%;
    margin: 0 auto;
  }
  .popular-plan {
    transform: none;
  }
}
</style>
