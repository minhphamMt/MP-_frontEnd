import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const [email, setEmail] = useState("jane@example.com");
  const [password, setPassword] = useState("123456"); // đổi theo user của bạn
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login({ email, password });

      // Điều hướng theo role (đúng Phase 0)
      if (user.role === "ADMIN") return navigate("/admin", { replace: true });
      if (user.role === "ARTIST") return navigate("/artist", { replace: true });
      return navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ maxWidth: 360 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
          />
        </div>

        {error && (
          <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>
        )}

        <button disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
