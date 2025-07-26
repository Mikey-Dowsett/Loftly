<script setup lang="ts">
import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthStore } from 'stores';

const auth = useAuthStore();
const stripePromise = loadStripe('pk_test_51Ro3YNDnWFQHUjwgKXSJHerEPWb44TFFLKS0op7qYmW5WruNyRIlRp9VSnP4zncfI0OmbC573KO8qVHRmthruuNT00uXDkxWgo');

const redirectToCheckout = async (plan: string, price_id: string) => {
  const stripe = await stripePromise;

  const res = await fetch('http://localhost:8000/create-checkout-session', {
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
};

const navigateToPost = () => {
  window.location.href = '/post';
};

const annual = ref(false);

const plans = [
  {
    name: 'Starter Tier',
    price_id: 'null',
    price_id_yearly: 'null',
    price: 0,
    description: 'Perfect for individuals testing the waters',
    features: [
      'All Open-Source platforms',
      'Up to 3 connected accounts',
      '5 posts per week',
      'Create text & image posts',
      'Basic post history (30 days)',
    ],
  },
  {
    name: 'Indie Tier',
    price_id: 'price_1Ro3epDnWFQHUjwgpTi2hP5P',
    price_id_yearly: 'price_1Ro63ADnWFQHUjwghdWjvUJH',
    price: 10,
    popular: true,
    description: 'Great for content creators and small businesses',
    features: [
      'Up to 10 connected accounts',
      '100 posts per month',
      'Video uploads (100MB)',
      'Schedule posts (30 days)',
      'Basic analytics dashboard',
      'AI hashtag generation',
      'Post templates (5)',
      'Email support',
      'Extended history (6 months)',
    ],
  },
  {
    name: 'Creator Tier',
    price_id: 'price_1Ro4WwDnWFQHUjwgRP6kgFea',
    price_id_yearly: 'null',
    price: 25,
    description: 'Advanced features for professional creators',
    features: [
      'Up to 25 connected accounts',
      '500 posts per month',
      'LinkedIn integration',
      'Advanced analytics',
      'AI message generation',
      'Custom messages per platform',
      'Priority support',
      'Extended history (1 year)',
    ],
  },
];
</script>

<template>
  <q-card style="text-align: center; width: 50%; margin: 3rem auto">
    <h3>Choose Your Plan</h3>
    <p class="text-caption">Start with our free tier and scale up as your needs grow</p>
    <q-toggle v-model="annual" label="Annual billing (save 20%)" color="primary" left-label />
  </q-card>

  <!-- Pricing Cards -->
  <div class="justify-center" style="display: flex">
    <div v-for="plan in plans" :key="plan.name" class="q-ma-md">
      <q-card :class="{ 'popular-plan': plan.popular }" flat bordered>
        <q-card-section>
          <h4>{{ plan.name }}</h4>
          <h5>
            ${{ annual ? (plan.price * 0.8).toFixed(2) : plan.price.toFixed(2)
            }}<span class="text-subtitle2">/month</span>
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
          <div class="text-subtitle2 q-mb-sm">Plan includes:</div>
          <q-list dense separator>
            <q-item v-for="feature in plan.features" :key="feature">
              <q-item-section avatar>
                <q-icon name="fa-solid fa-check" color="positive" />
              </q-item-section>
              <q-item-section>{{ feature }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.popular-plan {
  transform: scale(1.05);
  border: 2px solid var(--q-primary);
}

@media (max-width: 1024px) {
  .popular-plan {
    transform: none;
  }
}
</style>
