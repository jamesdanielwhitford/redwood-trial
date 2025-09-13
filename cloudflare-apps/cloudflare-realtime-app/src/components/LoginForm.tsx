import { useState } from 'react';

interface User {
  id: string;
  username: string;
  created_at: string;
}

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.user);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2 className="login-title">
        {isRegistering ? 'Create Account' : 'Login'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="login-section">
          <label className="login-label">
            Username:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
        </div>

        <div className="login-section">
          <label className="login-label">
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className={`login-button-primary ${(loading || !username || !password) ? 'disabled' : ''}`}
        >
          {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Login')}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
          className="login-button-secondary"
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </form>
    </div>
  );
}