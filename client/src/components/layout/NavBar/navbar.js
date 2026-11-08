import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./navbar.css";
import { useAuth } from '../../../contexts/AuthContext';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { username, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="logo">
          SummarEase
        </Link>
        <div className="nav-links">
          <Link to="/analyze" className={`nav-link ${location.pathname === "/analyze" ? "active" : ""}`}>
            Analyze
          </Link>
          <Link to="/features" className={`nav-link ${location.pathname === "/features" ? "active" : ""}`}>
            Features
          </Link>
          <Link to="/how-it-works" className={`nav-link ${location.pathname === "/how-it-works" ? "active" : ""}`}>
            How it works
          </Link>
          <Link to="/history" className={`nav-link ${location.pathname === "/history" ? "active" : ""}`}>
            History
          </Link>
          <Link to="/about" className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}>
            About
          </Link>
        </div>
        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <Link to="/history" className="nav-user">{username || "Account"}</Link>
              <button onClick={handleLogout} className="sign-up-button">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="sign-in-link">Sign in</Link>
              <Link to="/register" className="sign-up-button">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
