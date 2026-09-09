import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '../api';

const StoreContext = createContext(null);

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('argo_cart') || '[]');
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const notify = useCallback((message, kind = 'ok') => {
    setToast({ message, kind, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    localStorage.setItem('argo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let active = true;
    (async () => {
      const token = localStorage.getItem('argo_token');
      try {
        if (token) {
          const { user: me } = await api.me();
          if (active) setUser(me);
        }
      } catch {
        localStorage.removeItem('argo_token');
      }
      try {
        const { products: list } = await api.products();
        if (active) setProducts(list);
      } catch {
        // offline fallback products
        if (active) setProducts(FALLBACK);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.login(email, password);
    localStorage.setItem('argo_token', token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { token, user: u } = await api.register(name, email, password);
    localStorage.setItem('argo_token', token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('argo_token');
    setUser(null);
  }, []);

  const addToCart = useCallback(
    (product, qty = 1) => {
      setCart((prev) => {
        const found = prev.find((i) => i.id === product.id);
        if (found) {
          return prev.map((i) => (i.id === product.id ? { ...i, qty: Math.min(99, i.qty + qty) } : i));
        }
        return [...prev, { id: product.id, name: product.name, price: product.price, unit: product.unit, emoji: product.emoji, color: product.color, qty }];
      });
      notify(`${product.emoji} ${product.name} added`);
    },
    [notify]
  );

  const setQty = useCallback((id, qty) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((n, i) => n + i.price * i.qty, 0), [cart]);

  const value = {
    user,
    products,
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    cartTotal,
    toast,
    loading,
    login,
    register,
    logout,
    addToCart,
    setQty,
    clearCart,
    notify,
    refreshProducts: async () => {
      const { products: list } = await api.products();
      setProducts(list);
    }
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

const FALLBACK = [
  { id: 0, sku: 'OFF-000', name: 'Demo Avocado', category: 'Fruit & Veg', price: 1.25, unit: 'each', emoji: '🥑', color: '#6E8B3D', aisle: 1, shelf: 1, stock: 50, active: 1 },
  { id: 1, sku: 'OFF-001', name: 'Demo Bread', category: 'Bakery', price: 3.49, unit: 'each', emoji: '🍞', color: '#C89B5F', aisle: 4, shelf: 1, stock: 30, active: 1 }
];