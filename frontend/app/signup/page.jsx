'use client';

import { useState } from 'react';
import SignupForm from '../../components/auth/SignupForm';
import authService from '../../services/AuthService';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (userData) => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      // Abstraction: Call the specialized signup method.
      await authService.signup(userData);
      
      // Set success message and prompt user to login
      setSuccess(true);
      // Optional: Redirect to login page after a delay
      setTimeout(() => router.push('/login'), 2000); 
    } catch (err) {
      // Error is caught from the re-thrown error in ApiService
      setError(err.message || "Sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Create Account</h1>

      {/* Display feedback messages */}
      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '15px' }}>Success! Redirecting to login...</p>}
      
      {/* Conditionally render form or success message */}
      {!success && (
        <SignupForm onSubmit={handleSignup} disabled={loading} />
      )}
      
      {loading && <p style={{ marginTop: '15px', textAlign: 'center' }}>Creating account...</p>}

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        Already have an account? <a href="/login">Log in here</a>.
      </p>
    </div>
  );
};

export default SignupPage;
