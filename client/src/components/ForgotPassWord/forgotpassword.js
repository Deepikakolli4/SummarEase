import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./forgotpassword.css";
const apiUrl = process.env.REACT_APP_API_URL;
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/user/forgot-password`, { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError("Failed to send verification code.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/user/verify-code`, { email, code });
      if (res.data.success) {
        navigate("/login");
      } else {
        setError("Invalid verification code.");
      }
    } catch (err) {
      setError("Verification failed.");
    }
  };

  return (
    <div className="forgot-password">
      <form onSubmit={step === 1 ? handleSendCode : handleVerifyCode}>
        <h2>Forgot Password</h2>

        {step === 1 ? (
          <>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send Code</button>
          </>
        ) : (
          <>
            <label>Enter Verification Code</label>
            <input
              type="text"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit">Verify</button>
          </>
        )}

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
