import { useEffect } from 'react';
import { useStore } from '../state/StoreContext';

export default function CartDrawer({ open, onClose }) {
  const { cart, setQty, cartTotal, clearCart, user } = useStore();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className={`drawer-mask ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`drawer ${open ? 'open' : ''}`} role="dialog" aria-label="Shopping cart" aria-hidden={!open}>
        <div className="drawer-head">
          <h3>Your basket</h3>
          <span className="count">items</span>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="drawer-empty">
              <span className="big" aria-hidden="true">🧺</span>
              Your basket is empty.
              <br />
              Walk the 3D store or shop the shelves.
            </div>
          ) : (
            cart.map((item) => (
              <div className="line-item" key={item.id}>
                <span className="line-emoji" style={{ background: `${item.color}22` }}>{item.emoji}</span>
                <div className="line-info">
                  <div className="nm">{item.name}</div>
                  <div className="pr">
                    ${item.price.toFixed(2)} / {item.unit}
                  </div>
                </div>
                <div className="qty">
                  <button onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease">−</button>
                  <span className="n">{item.qty}</span>
                  <button onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase">+</button>
                </div>
                <div className="line-total">${(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-foot">
          <div className="drawer-total">
            <span>Total</span>
            <b>${cartTotal.toFixed(2)}</b>
          </div>
          {cart.length > 0 && (
            <>
              <button className="btn btn-primary btn-block" onClick={() => { onClose(); window.location.hash = '#/checkout'; }}>
                Checkout →
              </button>
              <button className="btn btn-ghost btn-block" onClick={clearCart}>
                Clear basket
              </button>
            </>
          )}
          {cart.length > 0 && !user && (
            <p className="shipping-note">Sign in at checkout to place your order.</p>
          )}
        </div>
      </aside>
    </>
  );
}