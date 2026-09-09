const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { getProductById } = require('../db');

// Stripe is optional in test mode. If STRIPE_SECRET_KEY is missing we still
// return a checkout URL shaped payload so the order flow works end-to-end.
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (err) {
  console.warn('[stripe] unavailable, using mock checkout', err.message);
}

router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const { items, successUrl, cancelUrl } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let total = 0;

    if (stripe) {
      const line_items = items.map((it) => {
        const p = getProductById(Number(it.id));
        total += p.price * it.qty;
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: p.name,
              description: `${p.unit} • ${p.category}`
            },
            unit_amount: Math.round(p.price * 100)
          },
          quantity: it.qty
        };
      });
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items,
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: String(req.user.id)
      });
      return res.json({ url: session.url, mock: false });
    }

    // Mock mode — returns a fake "pay now" URL the client can confirm directly.
    items.forEach((it) => {
      const p = getProductById(Number(it.id));
      total += (p ? p.price : 0) * it.qty;
    });
    const mockUrl = `${successUrl}?mock=1&ref=${encodeURIComponent(total.toFixed(2))}`;
    return res.json({ url: mockUrl, mock: true, total });
  } catch (err) {
    next(err);
  }
});

module.exports = router;