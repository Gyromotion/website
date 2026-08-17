import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.hash = '/';
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('Password reset email sent! Check your inbox.');
      setResetMode(false);
    } catch (err) {
      setError("Failed to send reset email. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-color)', width: '100%' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="mb-6 flex justify-center w-full">
            <img src={logo} alt="Gyromotion Logo" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Gyromotion Sign In</h2>
          <p className="text-muted text-sm mt-2">Sign in with your staff account.</p>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
        {msg && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{msg}</div>}

        {!resetMode ? (
          <form onSubmit={handleLogin}>
            <div className="form-group mb-4">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div className="form-group mb-6">
              <div className="flex justify-between items-center mb-1">
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <button type="button" onClick={() => { setResetMode(true); setError(''); setMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>Forgot Password?</button>
              </div>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <p className="text-sm text-muted mb-4 text-center">Enter your email address and we will send you a link to reset your password.</p>
            <div className="form-group mb-4">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-primary mb-3" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => { setResetMode(false); setError(''); setMsg(''); }} className="btn btn-outline" style={{ width: '100%', padding: '0.75rem' }}>
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
