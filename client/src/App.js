import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/home';
import Analyze from './pages/Analyze/analyze';
import NavBar from './components/layout/NavBar/navbar';
import About from './pages/About/about';
import Features from './pages/Features/Features';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import Login from './pages/Login/login';
import Register from './pages/Register/register';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword/forgotpassword';
import History from './pages/History/history';
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
            <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
