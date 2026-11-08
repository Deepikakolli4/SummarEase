import React, { useEffect } from "react";
import loadToken from "../../utils/auth";

const SomeComponent = () => {
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tokenData = await loadToken();
        console.log("Token data:", tokenData);
      } catch (err) {
        console.error("Error loading token:", err.message);
      }
    };

    fetchToken();
  }, []);

  return (
    <div>
      <h1>Some Component</h1>
    </div>
  );
};

export default SomeComponent;
