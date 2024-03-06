import React, { useContext, useState } from "react";
import Spinner from "./Spinner";
import axios from "axios";
import { AuthContext } from "./AuthContext";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

function Login() {
  const [username, setUsername] = useState("testuser1");
  const [password, setPassword] = useState("password123");
  const [isLoggingIn, setIsLoggingIn] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const { onLogin } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/auth-api/login`, {
        username,
        password,
      });

      setIsLoggingIn(false);
      onLogin(response.data.token); // Call onLogin only if login is successful
    } catch (error) {
      setIsLoggingIn(false);
      setLoginError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-heading">Welcome to YugaMovies</h1>
      <h2 className="login-subheading">Sign in to continue</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="search-button-container">
          <button type="submit">Sign In</button>
          {isLoggingIn && <Spinner />}
        </div>
      </form>
      <div>{loginError}</div>
    </div>
  );
}

export default Login;
