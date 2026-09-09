import { useState } from 'react';
import { useStore } from '../state/StoreContext';

export default function Register() {
  const { register } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await register(name, email, password);
      window.location.hash = u.role === 'admin' ? '#/admin' : '#/';
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create account</h1>
        <p className="sub">Join FreshBasket and keep your orders in one place.</p>
        {error && <div className="error-box">{error}</div>}
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password (6+ chars)</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
        <p className="auth-alt">
          Already a member? <a href="#/login">Sign in</a>
        </p>
      </form>
    </main>
  );
}