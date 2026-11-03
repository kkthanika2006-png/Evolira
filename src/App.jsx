import './App.css';
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import CharacterSelection from "./pages/CharacterSelection";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate(); 
  return (
    <main className="welcome-page">
      <nav className="navbar">
        <a className="brand" href="/" aria-label="Evolira home">
         <img className="brand-logo" src="/logo.png" alt="Evolira logo" />
         <span className="brand-name">Evolira</span>
       </a>  

        <span className="nav-note">A better you, every day.</span>

        <button
          className="nav-button"
          onClick={() => navigate("/signup")}
        >
          Get started <span aria-hidden="true">↗</span>
        </button>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            YOUR NEXT CHAPTER STARTS HERE
          </div>

          <h1>
            Become who
            <br />
            you <span className="highlight">want to be.</span>
          </h1>

          <p className="hero-description">
            Small habits. Meaningful progress. A stronger version of you.
            Build consistency, complete daily tasks, and watch your character
            evolve with every milestone.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => navigate("/signup")}
            >
              Begin your journey <span aria-hidden="true">→</span>
            </button>

            <span className="action-note">
              Progress at your own pace.
            </span>
          </div>

          <div className="benefits">
            <div className="benefit">
              <span className="benefit-icon">01</span>
              <span>Build lasting habits</span>
            </div>
            <div className="benefit">
              <span className="benefit-icon">02</span>
              <span>Earn daily rewards</span>
            </div>
            <div className="benefit">
              <span className="benefit-icon">03</span>
              <span>Evolve over time</span>
            </div>
          </div>
        </div>

        <div className="hero-art" aria-label="Your journey of personal growth">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-glow" />

          <div className="growth-card">
            <span className="growth-label">YOUR JOURNEY</span>
            <div className="growth-symbol">✳</div>
            <h2>Growth looks good on you.</h2>
            <p>Every consistent day is a step forward.</p>
            <div className="growth-progress">
              <span />
            </div>
            <div className="growth-footer">
              <span>Your potential</span>
              <span>∞</span>
            </div>
          </div>

          <div className="floating-note note-top">
            <span className="note-icon">✦</span>
            <span>
              <strong>One day at a time</strong>
              <small>Every step counts</small>
            </span>
          </div>

          <div className="floating-note note-bottom">
            <span className="note-icon note-pink">↗</span>
            <span>
              <strong>Keep becoming</strong>
              <small>Your progress matters</small>
            </span>
          </div>

          <span className="sparkle sparkle-one">✳</span>
          <span className="sparkle sparkle-two">✧</span>
          <span className="sparkle sparkle-three">·</span>
        </div>
      </section>

      <footer className="page-footer">
        <span>MADE FOR YOUR GROWTH</span>
        <span>Small steps. Extraordinary change.</span>
      </footer>
    </main>
  )
}


function SessionRedirect({ children }) {
  const [checkingSession, setCheckingSession] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (!error && data.session) {
        const avatarId = data.session.user?.user_metadata?.avatar_id;
        setRedirectTo(avatarId ? "/dashboard" : "/characters");
      }

      setCheckingSession(false);
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (redirectTo) {
      window.location.replace(redirectTo);
    }
  }, [redirectTo]);

  if (checkingSession || redirectTo) {
    return <main className="welcome-page">Loading Evolira...</main>;
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/"
  element={
    <SessionRedirect>
      <Home />
    </SessionRedirect>
  }
/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/characters" element={<CharacterSelection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
