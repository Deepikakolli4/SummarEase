import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';


const AuthContext = createContext();


export const useAuth = () => {
  return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("username"));
  const navigate = useNavigate();

 
  useEffect(() => {
    setIsLoggedIn(!!username);
  }, [username]);

 
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUsername = localStorage.getItem("username");
      setUsername(storedUsername || "");
      setIsLoggedIn(!!storedUsername);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

 
  const login = (userData) => {
    localStorage.setItem("username", userData.username);
    localStorage.setItem("accessToken", userData.access_token);
    setUsername(userData.username);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("accessToken");
    setUsername("");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const value = {
    username,
    isLoggedIn,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};