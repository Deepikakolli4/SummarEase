import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './register.css';
import register from './register.gif';
import PasswordInput from '../../components/common/PasswordInput';

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Fallback URL for local development

const Register = () => {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setLoading(false);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='register'>
      <form onSubmit={handleSubmit}>
        <div className="auth-mark" aria-hidden="true"><span className="auth-lock-icon" /></div>
        <header className="register-heading">
          <h1>Create your account</h1>
          <p>A fresh start with SummarEase.</p>
        </header>

        {loading && <img src={register} alt='' className='register-gif' />}

        {error && <p className='error' role="alert">{error}</p>}

        <div className="register-field">
          <label htmlFor="register-name"><span className="field-icon user-icon" aria-hidden="true" />Display name</label>
          <input
            id="register-name"
            type="text"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            required
            disabled={loading || success}
            autoComplete="name"
          />
        </div>

        <div className="register-field">
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
            autoComplete="email"
          />
        </div>

        <div className="register-field">
          <label htmlFor="register-password">Password</label>
          <PasswordInput
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || success}
            autoComplete="new-password"
          />
        </div>

        <div className="register-field">
          <label htmlFor="confirm-password">Confirm password</label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || success}
            autoComplete="new-password"
          />
        </div>

        <button className="register-submit" type='submit' disabled={loading || success}>
          <span aria-hidden="true">→</span>
          {loading ? 'Creating account...' : success ? 'Account created' : 'Create account'}
        </button>
        <p className="register-login">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
};

export default Register;
