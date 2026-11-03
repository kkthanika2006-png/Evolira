import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  supabase,
  setRememberMePreference,
} from "../lib/supabase";
import "./Signup.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    setRememberMePreference(rememberMe);
    
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        setMessage(error.message);
        return;
      }

      const avatarId = data.user?.user_metadata?.avatar_id;

      if (avatarId) {
        navigate("/dashboard");
      } else {
        navigate("/characters");
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="signup-page">
      <Link to="/" className="signup-back">
        ← Back to home
      </Link>

      <section className="signup-card">
        <h1>Welcome back.</h1>

        <p className="signup-subtitle">
          Log in to continue your journey.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <div className="remember-me-row">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
              />
              Remember me
            </label>
          </div>

          <p className="forgot-password-link">
            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </p>

          <button
            className="signup-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>

          {message && (
            <p role="alert">{message}</p>
          )}
        </form>

        <p className="signup-login">
          New to Evolira?{" "}
          <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
