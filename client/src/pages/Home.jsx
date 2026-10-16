import { useMemo, useState } from 'react';
import { useStore } from '../state/StoreContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { products } = useStore();
  const [q, setQ] = useState('');
  const featured = products.slice(0, 8);

  const cats = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  const catIcon = (c) => products.find((p) => p.category === c)?.emoji ?? '🛒';

  const submitSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    window.location.hash = query ? `#/products?q=${encodeURIComponent(query)}` : '#/products';
  };

  return (
    <main>
      <section className="hero" aria-label="FreshBasket grocery delivery">
        <div className="dust" aria-hidden="true" />
        <div className="hero-inner">
          <p className="hero-eyebrow">Groceries in 30 minutes</p>
          <h1>
            Everything you need,
            <br />
            delivered home.
          </h1>
          <p>
            Fresh produce, daily essentials and your favourite brands — order in taps,
            or walk the aisles yourself in the live 3D store.
          </p>
          <form className="hero-search" role="search" onSubmit={submitSearch}>
            <span className="mag" aria-hidden="true">🔍</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for atta, rice, apples, milk…"
              aria-label="Search for groceries"
            />
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
          <div className="hero-chips">
            <span className="hero-chip"><span aria-hidden="true">🛵</span> 30-min delivery</span>
            <a className="hero-chip" href="#/store"><span aria-hidden="true">🏬</span> Walk the 3D store</a>
            <span className="hero-chip"><span aria-hidden="true">🏷️</span> Best prices daily</span>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>scroll</span>
          <span className="arrow-down" />
        </div>
      </section>

      <section className="section" aria-label="Why order with FreshBasket">
        <div className="section-head">
          <span className="kicker">Why order with us</span>
          <h2>Top benefits</h2>
          <a className="see-all" href="#/products">Order now →</a>
        </div>
        <div className="offers">
          <div className="offer-card">
            <span className="offer-icon" aria-hidden="true">🛵</span>
            <div>
              <h3>30-minute delivery</h3>
              <p>Order from anywhere in the city and get it fast, packed fresh.</p>
            </div>
          </div>
          <div className="offer-card">
            <span className="offer-icon" aria-hidden="true">📍</span>
            <div>
              <h3>Live order tracking</h3>
              <p>Follow every order from pending → packed → shipped → delivered.</p>
            </div>
          </div>
          <div className="offer-card">
            <span className="offer-icon" aria-hidden="true">🏬</span>
            <div>
              <h3>Walkable 3D store</h3>
              <p>Browse the aisles in a live 3D world and grab items off the shelf.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Browse categories">
        <div className="section-head">
          <span className="kicker">Browse</span>
          <h2>What's on your list?</h2>
          <a className="see-all" href="#/products">See all →</a>
        </div>
        <div className="cat-circles">
          {cats.map((c) => (
            <a key={c} className="cat-circle" href={`#/products?cat=${encodeURIComponent(c)}`}>
              <span className="ico" aria-hidden="true">{catIcon(c)}</span>
              <span className="lb">{c}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="section" aria-label="Featured products">
        <div className="section-head">
          <span className="kicker">Fresh today</span>
          <h2>Best in your area</h2>
          <a className="see-all" href="#/products">See all →</a>
        </div>
        <div className="grid">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="section" aria-label="Why FreshBasket">
        <div className="section-head">
          <span className="kicker">Why FreshBasket</span>
          <h2>Not your average store</h2>
          <span className="rule" />
        </div>
        <div className="features">
          <Feature icon="🏪" title="Walkable 3D store" text="Move through aisles with WASD, aim at a product and grab it with a click. Shopping that feels like being there." />
          <Feature icon="⚡" title="Fast checkout" text="Your basket follows you everywhere. Pay with Stripe in test mode or the built-in mock checkout." />
          <Feature icon="📦" title="Full order tracking" text="Orders flow through pending → packed → shipped → delivered with live status updates in your account." />
          <Feature icon="🛠️" title="Admin ops" text="A real dashboard to manage stock, prices, aisles and fulfil orders — nothing is faked here." />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature">
      <span className="icon" aria-hidden="true">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
