import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("username"));

  // Update login status whenever the username changes
  useEffect(() => {
    setIsLoggedIn(!!username);
    if (username) {
      localStorage.setItem("username", username);
    } else {
      localStorage.removeItem("username");
    }
  }, [username]);

  // Listen for changes in localStorage (e.g., across tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUsername = localStorage.getItem("username") || "";
      setUsername(storedUsername);
      setIsLoggedIn(!!storedUsername);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUsername("");
      setIsLoggedIn(false);
      navigate("/login", { replace: true });
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, [navigate]);

  // Login function: Store username and access token
  const login = (userData) => {
    setUsername(userData.username);
    localStorage.setItem("username", userData.username);
    localStorage.setItem("accessToken", userData.access_token);
    localStorage.setItem("refreshToken", userData.refresh_token);
  };

  // Logout function: Remove stored data
  const logout = () => {
    setUsername("");
    localStorage.removeItem("username");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ username, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
