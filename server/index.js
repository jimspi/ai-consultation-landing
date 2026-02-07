import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey && !stripeKey.includes('REPLACE_ME')
  ? new Stripe(stripeKey)
  : null;

if (!stripe) {
  console.warn('WARNING: Stripe not configured. Set STRIPE_SECRET_KEY in server/.env');
}
const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ACCESS_CODES_FILE = join(__dirname, 'accessCodes.json');

// Server-side course definitions (prices validated here, never from client)
const COURSES = {
  'ai-agents': {
    name: 'AI Agent Expert Masterclass',
    description: 'Complete masterclass on building production-ready AI agents',
    priceCents: 19700,
  },
  'prompt-engineering': {
    name: 'Prompt Engineering Masterclass',
    description: 'Learn to write effective prompts for consistent, high-quality AI results',
    priceCents: 9700,
  },
  'steering-ai': {
    name: 'Steering AI Behavior',
    description: 'Master techniques to control, constrain, and direct AI outputs',
    priceCents: 14700,
  },
};

// Initialize access codes file if it doesn't exist
if (!existsSync(ACCESS_CODES_FILE)) {
  writeFileSync(ACCESS_CODES_FILE, JSON.stringify([], null, 2));
}

function readAccessCodes() {
  return JSON.parse(readFileSync(ACCESS_CODES_FILE, 'utf-8'));
}

function writeAccessCodes(codes) {
  writeFileSync(ACCESS_CODES_FILE, JSON.stringify(codes, null, 2));
}

// Stripe webhook needs raw body — must be before express.json()
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email || session.metadata?.email || '';
    const name = session.metadata?.name || '';
    const courseId = session.metadata?.courseId || 'ai-agents';
    const code = uuidv4();

    const codes = readAccessCodes();
    codes.push({
      code,
      email,
      name,
      courseId,
      createdAt: new Date().toISOString(),
      sessionId: session.id,
    });
    writeAccessCodes(codes);

    console.log(`Access code generated for ${email} (${courseId}): ${code}`);
  }

  res.json({ received: true });
});

// Parse JSON for all other routes
app.use(express.json());
app.use(cors({ origin: CLIENT_URL }));

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured. Add your keys to server/.env' });
  }

  const { name, email, courseId } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const course = COURSES[courseId];
  if (!course) {
    return res.status(400).json({ error: 'Invalid course selected' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      metadata: { name, email, courseId },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.name,
              description: course.description,
            },
            unit_amount: course.priceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&course=${courseId}`,
      cancel_url: `${CLIENT_URL}/`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Verify access code
app.post('/api/verify-code', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ valid: false, error: 'Code is required' });
  }

  const codes = readAccessCodes();
  const found = codes.find((c) => c.code === code);

  if (found) {
    res.json({ valid: true, courseId: found.courseId || 'ai-agents' });
  } else {
    res.json({ valid: false });
  }
});

// Serve static files in production
const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*path}', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
