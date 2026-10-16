export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-cols">
          <div className="footer-brand">
            <span className="footer-logo">FreshBasket</span>
            <p>
              Groceries delivered in 30 minutes — or walk the aisles yourself in our
              live 3D supermarket. Fresh, fast and always in stock.
            </p>
            <div className="app-badges">
              <span className="app-badge"><span aria-hidden="true">📱</span> App Store</span>
              <span className="app-badge"><span aria-hidden="true">▶</span> Google Play</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>For Consumers</h4>
            <a href="#/">Home</a>
            <a href="#/products">Shop all</a>
            <a href="#/store">3D Store</a>
            <a href="#/orders">Track an order</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#/">About FreshBasket</a>
            <a href="#/products">Our aisles</a>
            <a href="#/register">Careers</a>
            <a href="#/login">Account</a>
          </div>

          <div className="footer-col">
            <h4>For Partners</h4>
            <a href="#/admin">Admin console</a>
            <a href="#/register">Become a seller</a>
            <a href="#/products">Stock on FreshBasket</a>
            <a href="#/store">In-store experience</a>
          </div>
        </div>

        <div className="footer-legal">
          <span>© {year} FreshBasket — a walkable 3D store experiment.</span>
          <span className="footer-legal-links">
            <a href="#/">Privacy</a>
            <a href="#/">Terms</a>
            <a href="#/">English ▾</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
