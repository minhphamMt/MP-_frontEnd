import { useState } from "react";
import useAuthStore from "../store/auth.store";

export default function AuthTest() {
  const {
    user,
    role,
    isAuthenticated,
    loading,
    login,
    logout,
    loadUser,
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ padding: 20 }}>
      <h2>AUTH TEST PAGE</h2>

      <p><b>isAuthenticated:</b> {String(isAuthenticated)}</p>
      <p><b>loading:</b> {String(loading)}</p>
      <p><b>role:</b> {role}</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      <hr />

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={() => login({ email, password })}>
        LOGIN
      </button>

      <button onClick={logout} style={{ marginLeft: 10 }}>
        LOGOUT
      </button>

      <button onClick={loadUser} style={{ marginLeft: 10 }}>
        LOAD USER
      </button>
    </div>
  );
}
