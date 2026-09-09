import { useMemo, useState } from 'react';
import { useStore } from '../state/StoreContext';

export default function Products() {
  const { products, addToCart } = useStore();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products]);

  const list = useMemo(() => {
    return products.filter(
      (p) =>
        (cat === 'All' || p.category === cat) &&
        (q.trim() === '' || p.name.toLowerCase().includes(q.toLowerCase()))
    );
  }, [products, cat, q]);

  return (
    <main className="section">
      <div className="section-head">
        <span className="kicker">Catalog</span>
        <h2>All products</h2>
        <span className="rule" />
      </div>

      <div className="cats" role="tablist" aria-label="Filter by category">
        {categories.map((c) => (
          <button key={c} className={`cat-pill ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 22 }}>
        <input
          type="search"
          placeholder="Search the shelves…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search products"
        />
      </div>

      <div className="grid">
        {list.map((p) => (
          <article className="card" key={p.id}>
            <div className="card-thumb" style={{ background: `linear-gradient(135deg, ${p.color}2e, ${p.color}14)` }}>
              <span className="tag">{p.category}</span>
              <span aria-hidden="true">{p.emoji}</span>
            </div>
            <div className="card-body">
              <div className="meta">Aisle {p.aisle} · Shelf {p.shelf} · {p.stock} in stock</div>
              <h3>{p.name}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, margin: '4px 0 0' }}>{p.description}</p>
              <div className="card-foot">
                <span className="price">${p.price.toFixed(2)} <small>/{p.unit}</small></span>
                <button className="add-btn" onClick={() => addToCart(p)} disabled={p.stock <= 0}>
                  {p.stock <= 0 ? 'Sold out' : 'Add +'}
                </button>
              </div>
            </div>
          </article>
        ))}
        {list.length === 0 && <p style={{ color: 'var(--muted)' }}>No products match that search.</p>}
      </div>
    </main>
  );
}