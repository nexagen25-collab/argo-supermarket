import { useEffect, useRef, useState } from 'react';
import { useStore } from '../state/StoreContext';
import { StoreEngine } from '../three/Engine';

export default function Store3D() {
  const canvasRef = useRef(null);
  const minimapRef = useRef(null);
  const engineRef = useRef(null);
  const { products, addToCart, setCartOpen, cartCount } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || products.length === 0) return;
    const engine = new StoreEngine({
      canvas: canvasRef.current,
      minimap: minimapRef.current,
      products,
      onGrab: (product) => addToCart(product),
      onOpenCart: () => setCartOpen(true)
    });
    engineRef.current = engine;
    setReady(true);
    return () => engine.dispose();
  }, [products]);

  return (
    <div className="store-page">
      <canvas ref={canvasRef} className="store-canvas" aria-label="Walkable 3D supermarket" role="img" />

      <div className="store-hud store-topbar">
        <span className="pill on">3D STORE · LIVING GREEN</span>
        <span className="pill">WASD walk · drag to look · click to grab</span>
      </div>

      <div className="store-hud store-minimap">
        <canvas ref={minimapRef} aria-hidden="true" />
      </div>

      <div className={`store-hud grab-tip ${ready ? '' : 'show'}`}>Click a product to add it to your basket</div>

      <div className="store-hud store-controls">
        <span className="key"><b>W A S D</b><span>move</span></span>
        <span className="key"><b>🖱 drag</b><span>look</span></span>
        <span className="key"><b>click</b><span>grab</span></span>
        <span className="key"><b>E</b><span>cart</span></span>
      </div>

      <button className="store-hud store-cart-float btn btn-primary" onClick={() => setCartOpen(true)}>
        🧺 {cartCount > 0 ? `(${cartCount})` : ''}
      </button>

      <a className="store-hud store-close btn btn-ghost" href="#/products">Exit store</a>
    </div>
  );
}