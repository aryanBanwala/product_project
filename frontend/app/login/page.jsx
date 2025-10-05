'use client';

import { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import authService from '../../services/AuthService';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (credentials) => {
    setError(null);
    setLoading(true);
    try {
      await authService.login(credentials);
      router.push('/products'); 
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f7f7'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h1>User Login</h1>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
        <LoginForm onSubmit={handleLogin} disabled={loading} />
        {loading && <p style={{ marginTop: '15px', textAlign: 'center' }}>Logging in...</p>}
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Don't have an account? <a href="/signup">Sign up here</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;