/**
 * Authentication Page
 * Handles login and signup with tab switching
 */

import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, var(--dark-bg) 0%, var(--dark-surface) 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        padding: '40px',
        backgroundColor: 'var(--dark-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--dark-border)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {isLogin ? (
          <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
        ) : (
          <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
