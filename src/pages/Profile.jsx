import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Signup.css";

function getAgeGroup(age) {
  if (age <= 15) return "child";
  if (age <= 59) return "adult";
  return "elder";
}

const characterNames = {
  child_male_1: "Explorer",
  child_female_1: "Dreamer",
  child_male_2: "Achiever",
  child_female_2: "Creator",
  adult_male_1: "Visionary",
  adult_female_1: "Leader",
  adult_male_2: "Achiever",
  adult_female_2: "Innovator",
  elder_male_1: "Mentor",
  elder_female_1: "Wise Soul",
  elder_male_2: "Guardian",
  elder_female_2: "Inspiration",
};

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarId, setAvatarId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data, error: loadError } = await supabase.auth.getUser();

      if (!active) return;

      if (loadError || !data.user) {
        navigate("/login", { replace: true });
        return;
      }

      const metadata = data.user.user_metadata || {};

      setAvatarId(metadata.avatar_id || "");
      setName(metadata.full_name || "");
      setEmail(data.user.email || "");
      setAge(metadata.age ? String(metadata.age) : "");
      setAgeGroup(
        metadata.age_group ||
          (metadata.age ? getAgeGroup(Number(metadata.age)) : "")
      );
      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const fullName = name.trim();
    const userAge = Number(age);

    if (!fullName) {
      setError("Please enter your name.");
      return;
    }

    if (!Number.isInteger(userAge) || userAge < 8 || userAge > 120) {
      setError("Please enter a valid age between 8 and 120.");
      return;
    }

    const newAgeGroup = getAgeGroup(userAge);
    const needsNewCharacter = ageGroup !== newAgeGroup;

    setSaving(true);

    const profileData = {
      full_name: fullName,
      age: userAge,
      age_group: newAgeGroup,
    };

    if (needsNewCharacter) {
      profileData.avatar_id = null;
    }

    const { data, error: updateError } = await supabase.auth.updateUser({
      data: profileData,
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setName(data.user.user_metadata?.full_name || fullName);
    setAge(String(userAge));
    setAgeGroup(newAgeGroup);

    if (needsNewCharacter) {
      navigate("/characters", { replace: true });
      return;
    }

    setMessage("Your profile was updated.");
  }

  if (loading) {
    return <main className="signup-page">Loading your profile...</main>;
  }
  const avatarImage = avatarId
  ? `/avatars/${avatarId.replaceAll("_", "-")}.png`
  : "";

  return (
    <main className="signup-page">
      <Link to="/dashboard" className="signup-back">
        ← Back to dashboard
      </Link>

      <section className="signup-card">
        <h1>Your profile</h1>
        <p className="signup-subtitle">Manage your Evolira account details.</p>
        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "20px 0",
  }}
>
  {avatarImage && (
    <img
      src={avatarImage}
      alt="Your selected character"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
      style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  )}
  <div>
    <p>
      {avatarId
    ? `Your character: ${characterNames[avatarId] || "Selected"}`
    : "You haven’t selected a character yet."}
   </p>
    <Link to="/characters">
      {avatarId ? "Change character" : "Choose a character"}
    </Link>
  </div>
</div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="profile-name">Your name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            autoComplete="name"
            required
          />

          <label htmlFor="profile-age">Your age</label>
          <input
            id="profile-age"
            type="number"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            min="8"
            max="120"
            step="1"
            required
          />

          <label htmlFor="profile-email">Email address</label>
          <input
            id="profile-email"
            type="email"
            value={email}
            readOnly
          />

          <button
            className="signup-submit"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save profile"}
          </button>

          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}