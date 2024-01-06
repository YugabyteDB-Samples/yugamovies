// AuthProvider.js
import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp - Date.now() / 1000 > 0) {
        setAuthToken(decodedToken);
      } else {
        onLogout();
      }
    }
  }, []);

  const onLogin = (token) => {
    localStorage.setItem("token", token); // Save token to localStorage
    setAuthToken(jwtDecode(token));
  };

  const onLogout = () => {
    localStorage.removeItem("token"); // Clear token from localStorage
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, onLogin, onLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
