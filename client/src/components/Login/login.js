import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import loginGif from "./login.gif";
import doneGif from "./done.gif";
import walkGif from "./Walk.gif";
import { useAuth } from '../../contexts/AuthContex';

const apiUrl = process.env.REACT_APP_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setHasError(false);
    setLoading(true);
    
    setTimeout(async () => {
      try {
        const response = await fetch(`${apiUrl}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
          setSuccess(true);
          localStorage.setItem("username",data.username);
          login(data); // Use the context login function
          setTimeout(() => navigate("/home"), 2000);
        } else {
          setError(data.message || "Invalid credentials");
          setHasError(true);
        }
      } catch {
        setLoading(false);
        setError("Something went wrong. Please try again.");
        setHasError(true);
      }
    }, 1000);
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>

        {loading && <img src={loginGif} alt="Loading..." className="login-gif" />}
        {success && <img src={doneGif} alt="Success!" className="login-gif" />}
        {hasError && <img src={walkGif} alt="Error!" className="login-gif" />}

        {error && <p className="error">{error}</p>}

        <label>Email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || success}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading || success}
        />

        <button type="submit" disabled={loading || success}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="register-text">
          Don't have an account?
          <Link to="/register" className="nav-link"> Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
