import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      MySwal.fire({ icon: "success", title: "Welcome back!" });
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Login failed",
        text: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="bg-light d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          width: "100%",
          maxWidth: "480px",
          borderRadius: "1rem",
        }}
      >
        <h3 className="text-center mb-4">OceanRe System Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control form-control-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control form-control-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
