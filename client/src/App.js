import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/home';
import Summarize from './pages/Analyze/summarize';
import NavBar from './components/layout/NavBar/navbar';
import About from './pages/About/about';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login/login';
import Register from './pages/Register/register';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword/forgotpassword';
import UserDetails from './pages/History/userDetails';
function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route 
              path="/analyze"
              element={
                <ProtectedRoute>
                  <Summarize />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/history" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
            <Route path="/summarize" element={<Navigate to="/analyze" replace />} />
            <Route path="/userdetails" element={<Navigate to="/history" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
