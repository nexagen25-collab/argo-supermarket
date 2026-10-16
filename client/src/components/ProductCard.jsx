import { useStore } from '../state/StoreContext';
import { inr } from '../format';

/** Deterministic 4.0–4.9 rating so every card gets a stable Zomato-style badge. */
function ratingFor(id) {
  return (4 + ((id * 37) % 10) / 10).toFixed(1);
}

export default function ProductCard({ p, showDesc = false }) {
  const { addToCart } = useStore();
  const rating = ratingFor(p.id);

  return (
    <article className="card">
      <div
        className="card-thumb"
        style={{ background: `linear-gradient(140deg, ${p.color}45, ${p.color}16)` }}
      >
        <span className="tag">{p.category}</span>
        <span className="thumb-emoji" aria-hidden="true">{p.emoji}</span>
        <span className="rating-badge" title={`Rated ${rating} out of 5`}>
          {rating} <span aria-hidden="true">★</span>
        </span>
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <div className="cuisine">
          {p.category} · Aisle {p.aisle} · Shelf {p.shelf}
        </div>
        <div className="card-time">
          <span aria-hidden="true">🕒</span> 30–40 mins
          <span className="dot" aria-hidden="true" />
          {p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}
        </div>
        {showDesc && <p className="card-desc">{p.description}</p>}
        <div className="card-foot">
          <span className="price">{inr(p.price)} <small>/{p.unit}</small></span>
          <button className="add-btn" onClick={() => addToCart(p)} disabled={p.stock <= 0}>
            {p.stock <= 0 ? 'SOLD OUT' : 'ADD'}
          </button>
        </div>
      </div>
    </article>
  );
}
