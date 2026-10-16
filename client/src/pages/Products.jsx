import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../state/StoreContext';
import ProductCard from '../components/ProductCard';

function paramsFromHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('?');
  return new URLSearchParams(parts[1] || '');
}

export default function Products() {
  const { products } = useStore();
  const [cat, setCat] = useState(() => paramsFromHash().get('cat') || 'All');
  const [q, setQ] = useState(() => paramsFromHash().get('q') || '');

  useEffect(() => {
    const onHash = () => {
      const params = paramsFromHash();
      setQ(params.get('q') || '');
      setCat(params.get('cat') || 'All');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

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
        <h2>{cat === 'All' ? 'All products' : cat}</h2>
        <span className="rule" />
      </div>

      <div className="cats" role="tablist" aria-label="Filter by category">
        {categories.map((c) => (
          <button key={c} className={`cat-pill ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="search-big">
        <span className="mag" aria-hidden="true">🔍</span>
        <input
          type="search"
          placeholder="Search for groceries, brands and items"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search products"
        />
      </div>

      <p className="results-note">
        {list.length} {list.length === 1 ? 'item' : 'items'}
        {cat !== 'All' ? ` in ${cat}` : ''}
        {q.trim() ? ` matching “${q.trim()}”` : ''}
      </p>

      <div className="grid">
        {list.map((p) => <ProductCard key={p.id} p={p} showDesc />)}
      </div>
      {list.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>No products match that search.</p>
      )}
    </main>
  );
}
