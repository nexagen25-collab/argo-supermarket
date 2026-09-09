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
  const route = window.location.hash.replace(/^#/, '') || '/';

  return (
    <header className="nav" role="banner">
      <a className="brand" href="#/">
        <img className="mark" src="/logo.jpeg" alt="FreshBasket logo" width="45" height="45" style={{ objectFit: 'cover', borderRadius: 10 }} />
        <span>
          FreshBasket
          <small>walkable supermarket</small>
        </span>
      </a>

      <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
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

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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