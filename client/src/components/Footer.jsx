export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} FreshBasket — a walkable 3D store experiment.</span>
        <div className="links">
          <a href="#/">Home</a>
          <a href="#/products">Shop</a>
          <a href="#/store">3D Store</a>
          <a href="#/admin">Admin</a>
        </div>
      </div>
    </footer>
  );
}