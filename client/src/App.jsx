import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import Home from './pages/Home';
import Products from './pages/Products';
import Store3D from './pages/Store3D';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import { useStore } from './state/StoreContext';

export default function App() {
  const { cartOpen, setCartOpen, toast, loading } = useStore();
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  const path = route.path;

  let page;
  if (path === '/products') page = <Products />;
  else if (path === '/store') page = <Store3D />;
  else if (path === '/checkout') page = <Checkout />;
  else if (path === '/login') page = <Login />;
  else if (path === '/register') page = <Register />;
  else if (path === '/orders') page = <Orders />;
  else if (path === '/admin') page = <Admin />;
  else page = <Home />;

  return (
    <div className="app">
      <Navbar />
      {loading ? <div className="boot">loading aisles…</div> : page}
      {!loading && <Footer />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {toast && <Toast key={toast.id} toast={toast} />}
    </div>
  );
}

export function getRoute() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('?');
  const params = new URLSearchParams(parts[1] || '');
  return { path: parts[0].startsWith('/') ? parts[0] : `/${parts[0]}`, params };
}

export function navigate(path, params) {
  const qs = params ? `?${params.toString()}` : '';
  window.location.hash = path + qs;
}