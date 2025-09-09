// src/components/LoginForm/index.tsx
'use client'

import { FC, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; 
import './styles.css';


const LoginForm: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { login, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setError('');
    setSuccess('');
    setIsResettingPassword(true);

    try {
      if (resetPassword) {
        await resetPassword(email);
        setSuccess('If your email is registered, you will find a reset link in your inbox or spam. Contact us for help.');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      setSuccess('If your email is registered, you will find a reset link in your inbox or spam. Contact us for help.');
      //setError('Password reset failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsResettingPassword(false);
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
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <button 
          onClick={handleForgotPassword}
          disabled={isResettingPassword || isSubmitting}
          style={{
            background: 'none',
            border: 'none',
            color: '#E67F0F',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {isResettingPassword ? 'Sending...' : 'Forgot Password?'}
        </button>
      </div>

      <p>
        Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default LoginForm;