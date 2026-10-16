import { useState } from 'react';
import { useStore } from '../state/StoreContext';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/store', label: '3D Store' },
  { to: '/orders', label: 'Orders' },
  { to: '/admin', label: 'Admin' }
];

export default function Navbar() {
  const { cartCount, setCartOpen, user, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const route = window.location.hash.replace(/^#/, '').split('?')[0] || '/';

  const submitSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    window.location.hash = query ? `#/products?q=${encodeURIComponent(query)}` : '#/products';
    setOpen(false);
  };

  return (
    <header className="nav" role="banner">
      <div className="nav-left">
        <a className="brand" href="#/" aria-label="FreshBasket home">
          <img className="mark" src="/logo.jpeg" alt="FreshBasket logo" width="38" height="38" />
          <span className="brand-name">FreshBasket</span>
        </a>
        <button className="loc-chip" type="button" title="Delivery location">
          <span className="loc-pin" aria-hidden="true">📍</span>
          <span className="loc-text">
            <b>Koramangala, Bengaluru</b>
            <small>Delivery in 30–40 mins</small>
          </span>
          <span className="loc-caret" aria-hidden="true">▾</span>
        </button>
      </div>

      <nav className={`nav-tabs ${open ? 'open' : ''}`} aria-label="Main">
        {NAV.map((n) => (
          <a key={n.to} href={`#${n.to}`} className={route === n.to ? 'active' : ''} onClick={() => setOpen(false)}>
            {n.label}
          </a>
        ))}
        {user ? (
          <>
            <span className="user-chip" title={user.email}>
              <span aria-hidden="true">👤</span> {user.name}
            </span>
            <button className="nav-btn" onClick={() => { logout(); setOpen(false); }}>
              Sign out
            </button>
          </>
        ) : (
          <a href="#/login" className={route === '/login' ? 'active' : ''} onClick={() => setOpen(false)}>
            Sign in
          </a>
        )}
      </nav>

      <form className="nav-search" role="search" onSubmit={submitSearch}>
        <span className="mag" aria-hidden="true">🔍</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for groceries, brands and items"
          aria-label="Search for groceries, brands and items"
        />
      </form>

      <div className="nav-right">
        {!user && (
          <a className="login-btn" href="#/login">
            <span aria-hidden="true">👤</span> Sign in
          </a>
        )}
        <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${cartCount} items`}>
          🧺 <span className="sr-only">Cart</span>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
        <button
          className="menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
