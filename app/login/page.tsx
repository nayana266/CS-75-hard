"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client'; // Import the Supabase client

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data.user) {
      setMessage('Sign up successful! Please check your email to confirm.');
    } else {
       // This case might occur if signup is successful but no user object is immediately returned (e.g., email confirmation required)
      setMessage('Sign up successful! Please check your email to confirm.');
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data.user) {
       setMessage('Sign in successful!');
       // Redirect the user after successful sign-in, e.g., to the main page
       // window.location.href = '/';
    } else {
      setError('Sign in failed. Please check your credentials.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2>Sign Up or Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            margin: '10px 0',
            padding: '10px',
            width: '100%',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            margin: '10px 0',
            padding: '10px',
            width: '100%',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button
          onClick={handleSignUp}
          disabled={loading}
          style={{
            margin: '10px 5px 10px 0',
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            margin: '10px 0 10px 5px',
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
           {loading ? 'Loading...' : 'Sign In'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

      </div>
    </div>
  );
} 