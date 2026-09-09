import { useEffect, useState } from 'react';
import { useStore } from '../state/StoreContext';
import { api } from '../api';
import { getRoute } from '../App';

const INTENT_KEY = 'argo_checkout_intent';

export default function Checkout() {
  const { cart, cartTotal, user, clearCart, notify } = useStore();
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const route = getRoute();

  // restore saved address
  useEffect(() => {
    const saved = sessionStorage.getItem('argo_addr');
    if (saved) setAddress(saved);
    if (user && !saved) setAddress('1 Argo Way, Freshwater City');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // handle return from Stripe (session_id) or mock (mock=1)
  useEffect(() => {
    const mock = route.params.get('mock');
    const sid = route.params.get('session_id');
    if (!mock && !sid) return;
    const raw = sessionStorage.getItem(INTENT_KEY);
    const intent = raw ? JSON.parse(raw) : null;
    if (!intent) {
      window.location.hash = '#/orders?placed=1';
      return;
    }
    setBusy(true);
    api
      .createOrder(intent.items, intent.address, mock ? 'mock-payment' : sid ? `stripe:${sid}` : 'stripe')
      .then(({ order }) => {
        sessionStorage.removeItem(INTENT_KEY);
        clearCart();
        notify(`Order ${order.number} placed`);
        window.location.hash = '#/orders?placed=1';
      })
      .catch((err) => {
        setError(err.message);
        setBusy(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  const items = cart.map((i) => ({ id: i.id, qty: i.qty }));

  const onCheckout = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const addr = address.trim();
    try {
      if (!user) {
        notify('Sign in to complete your order', 'err');
        sessionStorage.setItem('argo_addr', addr);
        window.location.hash = '#/login';
        setBusy(false);
        return;
      }
      sessionStorage.setItem(INTENT_KEY, JSON.stringify({ items, address: addr }));
      sessionStorage.setItem('argo_addr', addr);
      const base = `${window.location.origin}${window.location.pathname}`;
      const { url } = await api.checkoutSession(items, `${base}#/checkout`, `${base}#/checkout?cancelled=1`);
      notify('Opening secure checkout…');
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const onPlaceMock = async () => {
    setBusy(true);
    setError('');
    const addr = address.trim();
    try {
      sessionStorage.setItem(INTENT_KEY, JSON.stringify({ items, address: addr }));
      sessionStorage.setItem('argo_addr', addr);
      await api.createOrder(items, addr, 'mock-local-order');
      sessionStorage.removeItem(INTENT_KEY);
      clearCart();
      notify('Order placed');
      window.location.hash = '#/orders?placed=1';
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (cart.length === 0 && !route.params.get('session_id') && !route.params.get('mock')) {
    return (
      <main className="section" style={{ textAlign: 'center', paddingTop: 120 }}>
        <h2 style={{ fontSize: 26 }}>Your basket is empty</h2>
        <p style={{ color: 'var(--muted)' }}>
          <a href="#/products" style={{ color: 'var(--accent)', fontWeight: 700 }}>Browse products</a> or{' '}
          <a href="#/store" style={{ color: 'var(--accent)', fontWeight: 700 }}>walk the 3D store</a>.
        </p>
      </main>
    );
  }

  const processingReturn = !!route.params.get('session_id') || !!route.params.get('mock');

  return (
    <main className="section">
      <div className="section-head">
        <span className="kicker">Checkout</span>
        <h2>Almost there</h2>
        <span className="rule" />
      </div>

      {processingReturn ? (
        <div className="summary-panel" style={{ textAlign: 'center', padding: 40 }}>
          <h3>Confirming your order…</h3>
        </div>
      ) : (
        <div className="checkout-grid">
          <form className="auth-card" onSubmit={onCheckout} style={{ maxWidth: 'none' }}>
            {error && <div className="error-box">{error}</div>}

            <div className="field">
              <label htmlFor="address">Delivery address</label>
              <textarea
                id="address"
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city, postcode"
                required
              />
            </div>

            {!user && (
              <div className="error-box" style={{ background: 'rgba(255,180,84,0.1)', borderColor: 'rgba(255,180,84,0.3)', color: 'var(--accent)' }}>
                You’ll be redirected to sign in before payment.
              </div>
            )}

            <button className="btn btn-primary btn-block" disabled={busy || !address.trim()}>
              {busy ? 'Processing…' : 'Pay with card →'}
            </button>

            <p className="auth-alt" style={{ marginTop: 12 }}>
              Demo mode: <button type="button" onClick={onPlaceMock} disabled={busy || !address.trim()} style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>place order without payment</button>
            </p>
          </form>

          <div className="summary-panel">
            <h3 style={{ margin: '0 0 8px' }}>Order summary</h3>
            {cart.map((i) => (
              <div className="summary-row muted" key={i.id}>
                <span>{i.qty}× {i.emoji} {i.name}</span>
                <span>${(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row muted">
              <span>Delivery</span>
              <span>Free</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <b>${cartTotal.toFixed(2)}</b>
            </div>
            <p className="shipping-note">
              💡 Stripe works in test mode — use card <code>4242 4242 4242 4242</code>, any future date, any CVC.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}