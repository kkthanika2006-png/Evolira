import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Signup.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo }
    );

    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage(
      "If an account exists for that email, a password reset link will be sent."
    );
  }

  return (
    <main className="signup-page">
      <Link to="/login" className="signup-back">← Back to log in</Link>

      <section className="signup-card">
        <h1>Reset your password</h1>
        <p className="signup-subtitle">
          Enter the email address associated with your account.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email">Email address</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <button
            className="signup-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>

          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}