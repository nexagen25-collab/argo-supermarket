import { useEffect, useState } from 'react';
import { useStore } from '../state/StoreContext';
import { api } from '../api';
import { inr } from '../format';

const EMPTY = {
  sku: '',
  name: '',
  category: '',
  description: '',
  price: 0,
  unit: 'each',
  stock: 0,
  aisle: 1,
  shelf: 1,
  emoji: '🛒',
  color: '#E8DCC8',
  active: 1
};

export default function Admin() {
  const { user, notify, refreshProducts } = useStore();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setBusy(false);
      return;
    }
    setBusy(true);
    Promise.all([api.orders(), api.adminProducts()])
      .then(([{ orders: o }, { products: p }]) => {
        setOrders(o);
        setProducts(p);
      })
      .catch(() => notify('Could not load admin data', 'err'))
      .finally(() => setBusy(false));
  }, [isAdmin, tab, notify]);

  const openNew = () => {
    setForm({ ...EMPTY, sku: `ARG-${String(products.length + 1).padStart(3, '0')}` });
    setModal('new');
  };

  const openEdit = (p) => {
    setForm({ ...p });
    setModal('edit');
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'new') await api.createProduct({ ...form, price: Number(form.price), stock: Number(form.stock) });
      else await api.updateProduct(form.id, { ...form, price: Number(form.price), stock: Number(form.stock) });
      notify('Product saved');
      setModal(null);
      refreshProducts();
      const { products: list } = await api.adminProducts();
      setProducts(list);
    } catch (err) {
      notify(err.message, 'err');
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (p) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    try {
      await api.deleteProduct(p.id);
      notify('Product deleted');
      refreshProducts();
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  const setStatus = async (o, status) => {
    try {
      await api.updateOrderStatus(o.id, status);
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status } : x)));
      notify(`Order ${o.number} → ${status}`);
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  if (!isAdmin) {
    return (
      <main className="section" style={{ textAlign: 'center', paddingTop: 120 }}>
        <h2 style={{ fontSize: 26 }}>Admin console</h2>
        <p style={{ color: 'var(--muted)' }}>
          {user ? 'You need admin access to view this.' : <a href="#/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign in as admin</a>}
        </p>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="section-head">
        <span className="kicker">Operations</span>
        <h2>Admin console</h2>
        <span className="rule" />
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'orders' ? 'on' : ''}`} onClick={() => setTab('orders')}>Orders ({orders.length})</button>
        <button className={`admin-tab ${tab === 'products' ? 'on' : ''}`} onClick={() => setTab('products')}>Products ({products.length})</button>
      </div>

      {busy ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : tab === 'orders' ? (
        <div className="orders-list">
          {orders.length === 0 && <p style={{ color: 'var(--muted)' }}>No orders yet.</p>}
          {orders.map((o) => (
            <div className="order-card" key={o.id}>
              <div className="order-head">
                <span className="order-number">#{o.number}</span>
                <span className="badge">{o.status}</span>
              </div>
              <div className="order-meta">
                <span>user #{o.userId}</span>
                <span>{new Date(o.createdAt * 1000).toLocaleString()}</span>
                <span>{inr(o.total)}</span>
                <span>{o.address}</span>
              </div>
              <div className="order-items-list">
                {o.items.map((it) => (
                  <div key={it.sku}>{it.qty}× {it.name}</div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <label htmlFor={`status-${o.id}`} className="sr-only">Status</label>
                <select
                  id={`status-${o.id}`}
                  className="status-select"
                  value={o.status}
                  onChange={(e) => setStatus(o, e.target.value)}
                >
                  {['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <button className="btn btn-primary" onClick={openNew} style={{ marginBottom: 18 }}>+ New product</button>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Aisle</th><th>Active</th><th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td>{p.emoji} {p.name}</td>
                    <td>{p.category}</td>
                    <td>{inr(p.price)}</td>
                    <td>{p.stock}</td>
                    <td>{p.aisle}-{p.shelf}</td>
                    <td>{p.active ? '✓' : '✗'}</td>
                    <td>
                      <button className="mini-btn" onClick={() => openEdit(p)}>Edit</button>
                      <button className="mini-btn danger" onClick={() => removeProduct(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal && (
        <div className="modal-mask" onClick={() => setModal(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={saveProduct}>
            <h2>{modal === 'new' ? 'New product' : `Edit ${form.name}`}</h2>
            <div className="form-row">
              <div className="field"><label>SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></div>
              <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
              <div className="field"><label>Unit</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Price ($)</label><input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="field"><label>Stock</label><input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Aisle</label><input type="number" min="1" value={form.aisle} onChange={(e) => setForm({ ...form, aisle: e.target.value })} required /></div>
              <div className="field"><label>Shelf</label><input type="number" min="1" value={form.shelf} onChange={(e) => setForm({ ...form, shelf: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Emoji</label><input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></div>
              <div className="field"><label>Color</label><input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
            </div>
            <div className="field"><label>Description</label><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-row">
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked ? 1 : 0 })} style={{ width: 'auto' }} />
                Active (visible in store)
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}