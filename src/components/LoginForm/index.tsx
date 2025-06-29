// src/components/LoginForm/index.tsx
'use client'

import { FC, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import './styles.css';


const LoginForm: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (login) {
        await login(email, password);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Login failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      {/* Add this right after the opening div */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <Link href="/" style={{ 
          color: '#E67F0F', 
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          ← Back to Home
        </Link>
      </div>
      <div className="brand-header">
        <h1 className="brand-title">ChessnKaffe Login</h1>
        <p className="brand-slogan">Chess connections over coffee</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default LoginForm;