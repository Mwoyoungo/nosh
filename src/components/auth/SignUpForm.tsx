/**
 * Sign Up Form Component
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Chip } from '@/components/ui';
import { Icons } from '@/theme';
import { signUp } from '@/services/firebase/auth';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

const SignUpForm = ({ onSwitchToLogin }: SignUpFormProps) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<'NORMAL_USER' | 'VENDOR'>('NORMAL_USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName, userRole);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="text-gradient-coral" style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          Join Nosh
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Create your account
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--error)',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<Icons.Profile size={20} />}
          required
        />

        <Input
          type="email"
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Icons.Mail size={20} />}
          required
        />

        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Icons.Settings size={20} />}
          helperText="At least 6 characters"
          required
        />

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            I am a:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Chip
              label="User"
              variant={userRole === 'NORMAL_USER' ? 'primary' : 'default'}
              selected={userRole === 'NORMAL_USER'}
              onClick={() => setUserRole('NORMAL_USER')}
            />
            <Chip
              label="Vendor"
              variant={userRole === 'VENDOR' ? 'primary' : 'default'}
              selected={userRole === 'VENDOR'}
              onClick={() => setUserRole('VENDOR')}
            />
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth loading={loading}>
          Create Account
        </Button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Already have an account?{' '}
          </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              color: 'var(--coral-400)',
              fontSize: '14px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
