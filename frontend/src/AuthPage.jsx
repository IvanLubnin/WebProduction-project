import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AuthPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) =>
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  // === LOGIN ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        console.log("Login response:", data);
        navigate("/tasks"); // go to tasks page
      }
    } catch (err) {
      setError("Server connection error");
      console.error(err);
    }
  };

  // === REGISTER ===
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (registerData.password !== registerData.repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        console.log("Register response:", data);
        // сразу ведём на страницу задач
        navigate("/tasks");
      }
    } catch (err) {
      setError("Server connection error");
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      {/* Login */}
      <div className="form-container">
        <h2>
          Already have account? <span>Log in</span>
        </h2>
        <form onSubmit={handleLogin}>
          <label>
            email:
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
          </label>

          <label>
            password:
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              className="password-input"
            />
          </label>

          <button type="submit">Log in</button>
        </form>
      </div>

      {/* Register */}
      <div className="form-container">
        <h2>
          Don’t have account? <span>Create user</span>
        </h2>
        <form onSubmit={handleRegister}>
          <label>
            user name:
            <input
              type="text"
              name="username"
              value={registerData.username}
              onChange={handleRegisterChange}
              required
            />
          </label>

          <label>
            email:
            <input
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
          </label>

          <label>
            password:
            <input
              type="password"
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
              className="password-input"
            />
          </label>

          <label>
            repeat password:
            <input
              type="password"
              name="repeatPassword"
              value={registerData.repeatPassword}
              onChange={handleRegisterChange}
              required
              className="password-input"
            />
          </label>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <button type="submit" className="register-btn">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
