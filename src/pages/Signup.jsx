
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import "./Signup.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    if (!Number.isInteger(userAge) || userAge < 8 || userAge > 120) {
      setMessage("Please enter a valid age between 8 and 120.");
      return;
    }

    if (!["male", "female"].includes(gender)) {
      setMessage("Please select your gender.");
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
        "Account created! Please check your email if confirmation is required. Then log in to choose your character."
      );
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
          <select
            id="gender"
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            required
          >
            <option value="">Choose your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />

          <button
            type="submit"
            className="signup-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create my account"}
          </button>

          {message && (
            <p role="status" aria-live="polite">
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
