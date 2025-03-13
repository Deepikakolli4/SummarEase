import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './navbar.css';
import linkgif from './link.gif';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || ""); 
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(localStorage.getItem("username") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("accessToken");
    setUsername("");
    navigate("/login"); 
  };

  const handleSummarizeClick = (e) => {
    if (!username) {
      e.preventDefault(); 
      navigate("/login"); 
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="logo">
          <img src={linkgif} alt="logo" className="img" />
          SummarEase
        </Link>
        <div className="nav-links">
          <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/summarize" className="nav-link" onClick={handleSummarizeClick}>
            Summarize
          </Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
            About
          </Link>
          {username && <span className="nav-user">{username}</span>} {/* Show username after About */}
          {username ? (
            <button onClick={handleLogout} className="nav-link logout-button">
              Logout
            </button>
          ) : (
            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
