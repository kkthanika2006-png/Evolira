
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "./Signup.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getAgeGroup(userAge) {
    if (userAge <= 15) return "child";
    if (userAge <= 59) return "adult";
    return "elder";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const userAge = Number(age);

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!Number.isInteger(userAge) || userAge < 8 || userAge > 120) {
      setMessage("Please enter a valid age between 8 and 120.");
      return;
    }

    if (!["male", "female"].includes(gender)) {
      setMessage("Please select your gender.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            age: userAge,
            age_group: getAgeGroup(userAge),
            gender: gender,
            avatar_id: null,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Account created successfully! Please check your email for confirmation if required. After confirmation, log in to choose your character."
      );

      setName("");
      setAge("");
      setGender("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="signup-page">
      <Link to="/" className="signup-back">
        <ArrowLeft size={18} /> Back to home
      </Link>

      <section className="signup-card">
        <div className="signup-icon">
          <Sparkles size={25} />
        </div>

        <h1>Begin your evolution.</h1>

        <p className="signup-subtitle">
          Small steps today. A stronger you tomorrow.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            autoComplete="name"
            required
          />

          <label htmlFor="age">Your age (in years)</label>
          <input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            min="8"
            max="120"
            step="1"
            required
          />

          <label htmlFor="gender">Select your gender</label>
          <div className="signup-select-wrapper">
            <select
              id="gender"
              className="signup-select"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              required
            >
              <option value="" disabled>
                Choose your gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <ChevronDown
              className="signup-select-icon"
              size={18}
              aria-hidden="true"
            />
          </div>

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="signup-password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="signup-eye-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="signup-password-wrapper">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="signup-eye-button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="signup-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create my account"}
          </button>

          {message && (
            <p
              className="signup-message"
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}
        </form>

        <p className="signup-login">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
