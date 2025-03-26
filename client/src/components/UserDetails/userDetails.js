import React, { useEffect, useState } from "react";
import axios from "axios";
import "./userDetails.css";
import { useAuth } from '../../contexts/AuthContex';

const apiUrl = process.env.REACT_APP_API_URL;

const UserDetails = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { username } = useAuth(); // Get username from context

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (!token) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        const response = await axios.post(`${apiUrl}/user/userdetails`, {
          username: username 
        }, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        console.log("Response data:", response.data);

        setUser({
          username: response.data.user.username,
          email: response.data.user.email,
        });
        setHistory(response.data.history || []);
      } catch (err) {
        setError("Failed to fetch user details");
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [username]); // Add username as a dependency

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="user-details-container">
      <h2>User Details</h2>
      {user ? (
        <div className="user-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>User not found.</p>
      )}

      <h2>User History</h2>
      {history.length > 0 ? (
        <ul className="user-history">
          {history.map((item, index) => (
            <li key={index}>
              <p><strong>Action:</strong> {item.action}</p>
              <p><strong>Date:</strong> {new Date(item.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No history available.</p>
      )}
    </div>
  );
};

export default UserDetails;
