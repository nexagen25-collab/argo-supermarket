import { useStore } from '../state/StoreContext';
import { inr } from '../format';

export default function Home() {
  const { products } = useStore();
  const featured = products.slice(0, 8);

  return (
    <main>
      <section className="hero" aria-label="Argo walkable supermarket">
        <div className="dust" aria-hidden="true" />
        <div className="hero-inner">
          <p className="hero-eyebrow">Argo Supermarket</p>
          <h1>
            Walk the aisles.
            <br />
            Shop in 3D.
          </h1>
          <p>
            A fully built supermarket experience — wander the shelves in a live 3D store,
            or browse the catalog and check out in seconds.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#/store">Enter the 3D store</a>
            <a className="btn btn-ghost" href="#/products">Browse products</a>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>scroll</span>
          <span className="arrow-down" />
        </div>
      </section>

      <section className="section" aria-label="Featured products">
        <div className="section-head">
          <span className="kicker">Fresh today</span>
          <h2>Featured produce</h2>
          <span className="rule" />
        </div>
        <div className="grid">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="section" aria-label="Why Argo">
        <div className="section-head">
          <span className="kicker">Why Argo</span>
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

function ProductCard({ p }) {
  const { addToCart } = useStore();
  return (
    <article className="card">
      <div className="card-thumb" style={{ background: `linear-gradient(135deg, ${p.color}2e, ${p.color}14)` }}>
        <span className="tag">{p.category}</span>
        <span aria-hidden="true">{p.emoji}</span>
      </div>
      <div className="card-body">
        <div className="meta">Aisle {p.aisle} · Shelf {p.shelf}</div>
        <h3>{p.name}</h3>
        <div className="card-foot">
          <span className="price">{inr(p.price)} <small>/{p.unit}</small></span>
          <button className="add-btn" onClick={() => addToCart(p)}>Add +</button>
        </div>
      </div>
    </article>
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