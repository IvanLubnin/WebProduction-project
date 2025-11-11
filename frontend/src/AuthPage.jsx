import { useState } from "react";
import "./AuthPage.css";

export default function AuthPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState("");

  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) =>
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login:", loginData);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    if (registerData.password !== registerData.repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    console.log("Register:", registerData);
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

          <button type="submit" className="register-btn">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
