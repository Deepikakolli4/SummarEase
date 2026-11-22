import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import loginGif from "./login.gif";
import { useAuth } from '../../contexts/AuthContext';
import PasswordInput from '../../components/common/PasswordInput';
import { loginUser } from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(async () => {
      try {
        const response = await loginUser({ email, password });
        const data = response.data;
        setLoading(false);
        setSuccess(true);
        localStorage.setItem("username", data.username);
        login(data);
        navigate("/analyze");
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.message || "Invalid credentials");
      }
    }, 1000);
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <div className="auth-mark" aria-hidden="true"><span className="auth-lock-icon" /></div>
        <header className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to your SummarEase account.</p>
        </header>

        {loading && <img src={loginGif} alt="" className="login-gif" />}

        {error && <p className="error" role="alert">{error}</p>}

        <div className="login-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
            autoComplete="email"
          />
        </div>

        <div className="login-field">
          <div className="login-label-row">
            <label htmlFor="login-password">Password</label>
            <Link to="/forgotpassword">Forgot password?</Link>
          </div>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || success}
            autoComplete="current-password"
          />
        </div>

        <button className="login-submit" type="submit" disabled={loading || success}>
          <span aria-hidden="true">→</span>
          {loading ? "Signing in..." : success ? "Signed in" : "Sign in"}
        </button>

        <p className="login-register-link">
          Don’t have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
