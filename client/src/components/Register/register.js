import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './register.css';
import register from './register.gif';  
import successGif from './success.gif';  
import errorGif from './Walk.gif';  

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Fallback URL for local development

const Register = () => {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setHasError(false);

    // Input validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      setHasError(true);
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
        setHasError(true);
      }
    } catch (error) {
      setLoading(false);
      setError('Something went wrong. Please try again.');
      setHasError(true);
    }
  };

  return (
    <div className='register'>
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>

        {loading && <img src={register} alt='Registering...' className='register-gif' />}
        {success && <img src={successGif} alt='Success!' className='register-gif' />}
        {hasError && <img src={errorGif} alt='Error!' className='register-gif' />}

        {error && <p className='error'>{error}</p>}

        <label>Username</label>
        <input 
          type='text' 
          value={username} 
          onChange={(e) => setUserName(e.target.value)} 
          required 
          disabled={loading || success}
        />

        <label>Email</label>
        <input 
          type='email' 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          disabled={loading || success}
        />

        <label>Password</label>
        <input 
          type='password' 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          disabled={loading || success}
        />

        <button type='submit' disabled={loading || success}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
