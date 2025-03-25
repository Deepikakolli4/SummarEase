import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./forgotpassword.css";

const apiUrl = process.env.REACT_APP_API_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState(""); // New password state
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Step 1: Send verification code
  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/user/forgotpassword`, { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError("Failed to send verification code.");
    }
  };

  // Step 2: Verify code and reset password
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/user/verify-code`, { email, code });
  
      console.log("API Response:", res.data); // Log response to debug
  
      if (res.data.success) {
        setMessage("Code verified! Enter your new password.");
        setStep(3); // Move to password reset step
      } else {
        setError(res.data.message || "Invalid verification code.");
      }
    } catch (err) {
      console.error("Verification failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Verification failed.");
    }
  };
  
  // Step 3: Update the password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/user/verify-code`, {
        email,
        code,
        newPassword,
        isPasswordUpdate: true, // Indicates password update
      });

      if (res.data.success) {
        setMessage("Password updated successfully! You can now log in.");
        setTimeout(() => navigate("/login"), 2000); // Redirect after success
      } else {
        setError("Failed to update password.");
      }
    } catch (err) {
      setError("Password update failed.");
    }
  };

  return (
    <div className="forgot-password">
      <form
        onSubmit={
          step === 1
            ? handleSendCode
            : step === 2
            ? handleVerifyCode
            : handleUpdatePassword
        }
      >
        <h2>Forgot Password</h2>

        {step === 1 && (
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
        )}

        {step === 2 && (
          <>
            <label>Enter Verification Code</label>
            <input
              type="text"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit">Verify Code</button>
          </>
        )}

        {step === 3 && (
          <>
            <label>Enter New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit">Update Password</button>
          </>
        )}

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
