import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/home';
import Summarize from './components/Summarize/summarize';
import NavBar from './components/NavBar/navbar';
import About from './components/About/about';
import Login from './components/Login/login';
import Register from './components/Register/register';
import { AuthProvider } from './contexts/AuthContex';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ForgotPassword from './components/ForgotPassWord/forgotpassword';
import UserDetails from './components/UserDetails/userDetails';
function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route 
              path="/summarize" 
              element={
                <ProtectedRoute>
                  <Summarize />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path = "/userdetails" element= { <UserDetails />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
