// server/index.ts
import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-08-16' });

// Example API route for Supabase
app.get('/api/data', (req, res) => {
  void(async () => {
    const { data, error } = await supabase.from('my_table').select('*');
    if (error) return res.status(500).json({ error });
    res.json(data);
  });
});

// Example API route for Stripe
app.post('/api/create-payment-intent', (req, res) => {
  void(async () => {
    const { amount } = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err: never) {
      res.status(500).json({ error: err.message });
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
