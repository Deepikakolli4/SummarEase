import axios from "axios";

const loadToken = async () => {
  try {
    const response = await axios({
      url: `${process.env.REACT_APP_API_URL}/auth/token`, // Replace with actual URL
      headers: {
        'Authorization': 'Bearer your-auth-token', // Replace with actual token
        'Content-Type': 'application/json',
      },
      data: {
        // Add any required data here
      },
      method: 'POST'
    });

    const data = response.data;
    return {
      tokenInfo: data,
      timestamp: new Date().getTime()
    };
  } catch (err) {
    console.error("Error fetching token:", err.response?.data || err.message);
    throw new Error("Failed to load token");
  }
};

export default loadToken;
