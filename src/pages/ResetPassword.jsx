import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Signup.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. Taking you to your dashboard...");
    window.setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1200);
  }

  return (
    <main className="signup-page">
      <Link to="/login" className="signup-back">← Back to log in</Link>

      <section className="signup-card">
        <h1>Choose a new password</h1>
        <p className="signup-subtitle">Use at least 8 characters.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button
            className="signup-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>

          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}