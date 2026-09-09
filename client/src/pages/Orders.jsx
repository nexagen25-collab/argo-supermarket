import { useEffect, useState } from 'react';
import { useStore } from '../state/StoreContext';
import { api } from '../api';
import { getRoute } from '../App';

const STATUS_META = {
  pending: 'Payment received, awaiting dispatch',
  paid: 'Order paid and confirmed',
  packed: 'Being packed for delivery',
  shipped: 'On the truck, heading your way',
  delivered: 'Delivered — enjoy!',
  cancelled: 'Order was cancelled'
};

export default function Orders() {
  const { user } = useStore();
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(true);
  const route = getRoute();

  useEffect(() => {
    if (!user) {
      setBusy(false);
      return;
    }
    api
      .orders()
      .then(({ orders: list }) => setOrders(list))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [user]);

  if (!user) {
    return (
      <main className="section" style={{ textAlign: 'center', paddingTop: 120 }}>
        <h2 style={{ fontSize: 26 }}>Your orders</h2>
        <p style={{ color: 'var(--muted)' }}>
          <a href="#/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign in</a> to view your orders.
        </p>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="section-head">
        <span className="kicker">Account</span>
        <h2>Your orders</h2>
        <span className="rule" />
      </div>
      {route.params.get('placed') === '1' && (
        <div className="error-box" style={{ background: 'rgba(87,214,141,0.1)', borderColor: 'rgba(87,214,141,0.35)', color: 'var(--ok)' }}>
          Order placed successfully!
        </div>
      )}
      {busy ? (
        <p style={{ color: 'var(--muted)' }}>Loading orders…</p>
      ) : orders.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No orders yet — head to the checkout to place your first one.</p>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div className="order-card" key={o.id}>
              <div className="order-head">
                <span className="order-number">#{o.number}</span>
                <span className={`badge ${o.status}`}>{o.status}</span>
              </div>
              <div className="order-meta">
                <span>{new Date(o.createdAt * 1000).toLocaleDateString()}</span>
                <span>${o.total.toFixed(2)}</span>
                <span>{o.items.length} item(s)</span>
                {o.paymentId && <span title={o.paymentId}>Payment: {o.paymentId.slice(0, 14)}…</span>}
              </div>
              <div className="order-items-list">
                {o.items.map((it) => (
                  <div key={it.sku}>{it.qty}× {it.name}</div>
                ))}
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--muted)' }}>{STATUS_META[o.status]}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}