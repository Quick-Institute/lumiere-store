import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Flower2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setShowPass(false);
    setShowConfirm(false);
  };

  const finish = (result) => {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(result.user.role === "admin" ? "/admin" : "/account");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (form.password !== form.confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    setBusy(true);
    const result =
      mode === "register"
        ? await register(form.name, form.email, form.password)
        : await login(form.email, form.password);
    setBusy(false);
    finish(result);
  };

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-side">
          <Flower2 size={46} strokeWidth={1.2} />
          <h2>Lumiere</h2>
          <p className="auth-script">Fashion for every you</p>
          <p className="auth-side-text">
            Sign in to shop the latest styles, track your orders and save your favourites.
          </p>
        </div>

        <div className="auth-card">
          <p className="label">Welcome to Lumiere</p>
          <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>
          <p className="auth-sub">
            {mode === "login"
              ? "Enter your details to continue."
              : "Join us in just a few seconds."}
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={submit}>
            {mode === "register" && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <div className="input-wrap">
                  <User size={18} className="input-icon" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={change}
                    required
                  />
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={change}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={change}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <div className="input-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    name="confirm"
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={change}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn auth-submit" disabled={busy}>
              {busy ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
              {!busy && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "New to Lumiere?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;