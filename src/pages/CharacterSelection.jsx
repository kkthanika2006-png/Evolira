
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Sparkles, ArrowRight } from "lucide-react";
import "./CharacterSelection.css";

// One default character for each age-group and gender combination.
const characters = {
  child_male: {
    id: "child_male_1",
    name: "Explorer",
    image: "/avatars/child-male-1.png",
  },
  child_female: {
    id: "child_female_1",
    name: "Dreamer",
    image: "/avatars/child-female-1.png",
  },
  adult_male: {
    id: "adult_male_1",
    name: "Visionary",
    image: "/avatars/adult-male-1.png",
  },
  adult_female: {
    id: "adult_female_1",
    name: "Leader",
    image: "/avatars/adult-female-1.png",
  },
  elder_male: {
    id: "elder_male_1",
    name: "Mentor",
    image: "/avatars/elder-male-1.png",
  },
  elder_female: {
    id: "elder_female_1",
    name: "Wise Soul",
    image: "/avatars/elder-female-1.png",
  },
};

function getAgeGroup(userAge) {
  if (userAge <= 15) return "child";
  if (userAge <= 59) return "adult";
  return "elder";
}

export default function CharacterSelection() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [age, setAge] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        navigate("/login");
        return;
      }

      const currentUser = data.user;
      const metadata = currentUser.user_metadata || {};

      const savedAge = Number(metadata.age) || "";
      const savedGender = (metadata.gender || "").toLowerCase();

      setUser(currentUser);
      setAge(String(savedAge));
      setGender(savedGender);

      if (savedAge >= 8 && savedAge <= 120) {
        const group = getAgeGroup(savedAge);
        setAgeGroup(group);

        if (["male", "female"].includes(savedGender)) {
          const character = characters[`${group}_${savedGender}`];

          // Keep the saved avatar if it belongs to this age/gender.
          setSelected(
            metadata.avatar_id === character.id
              ? metadata.avatar_id
              : character.id
          );
        }
      }

      setLoading(false);
    }

    loadUser();
  }, [navigate]);

  async function saveDemographics() {
    const userAge = Number(age);

    if (!Number.isInteger(userAge) || userAge < 8 || userAge > 120) {
      setMessage("Please enter a valid age between 8 and 120.");
      return;
    }

    if (!["male", "female"].includes(gender)) {
      setMessage("Please select your gender.");
      return;
    }

    const group = getAgeGroup(userAge);
    const character = characters[`${group}_${gender}`];

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase.auth.updateUser({
      data: {
        age: userAge,
        age_group: group,
        gender: gender,
        avatar_id: character.id,
      },
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setUser(data.user);
    setAgeGroup(group);
    setSelected(character.id);
    setMessage("Your details have been saved!");
  }

  async function saveCharacter() {
    if (!selected || !user || !ageGroup || !gender) return;

    const character = characters[`${ageGroup}_${gender}`];

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase.auth.updateUser({
      data: {
        avatar_id: character.id,
      },
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setUser(data.user);
    navigate("/dashboard");
  }

  if (loading) {
    return <main className="character-page">Loading...</main>;
  }

  const currentCharacter =
    ageGroup && gender
      ? characters[`${ageGroup}_${gender}`]
      : null;

  return (
    <main className="character-page">
      <section className="character-container">

        <div className="character-heading">
          <Sparkles size={25} />
          <p className="character-eyebrow">YOUR EVOLIRA JOURNEY</p>
          <h1>Choose your character</h1>
          <p>
            Your journey is unique. Let's find the character
            that represents you.
          </p>
        </div>

        {!ageGroup || !gender ? (
          <div className="age-selection">
            <h2>Personalize your character</h2>
            <p>
              Enter your age and select your gender to find
              your matching Evolira character.
            </p>

            {!ageGroup && (
              <>
                <label htmlFor="character-age">Your age</label>
                <input
                  id="character-age"
                  type="number"
                  min="8"
                  max="120"
                  step="1"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </>
            )}

            {!gender && (
              <>
                <label htmlFor="character-gender">
                  Select your gender
                </label>
                <select
                  id="character-gender"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  <option value="">Choose your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </>
            )}

            <button
              className="character-continue"
              onClick={saveDemographics}
              disabled={saving}
            >
              {saving ? "Saving..." : "Continue"}
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <>
            <p className="character-gender">
              {ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1)}
              {" · "}
              {gender.charAt(0).toUpperCase() + gender.slice(1)}
            </p>

            <div className="character-grid">
              <button
                type="button"
                className={`character-card ${
                  selected === currentCharacter.id ? "selected" : ""
                }`}
                onClick={() => setSelected(currentCharacter.id)}
              >
                <div className="character-image">
                  <img
                    src={currentCharacter.image}
                    alt={currentCharacter.name}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <span className="character-name">
                  {currentCharacter.name}
                </span>

                <span className="character-gender">
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </span>

                {selected === currentCharacter.id && (
                  <span className="character-check">
                    Selected ✓
                  </span>
                )}
              </button>
            </div>

            <button
              className="character-continue"
              onClick={saveCharacter}
              disabled={!selected || saving}
            >
              {saving ? "Saving..." : "Continue to dashboard"}
              <ArrowRight size={18} />
            </button>
          </>
        )}

        {message && (
          <p className="character-message" role="status">
            {message}
          </p>
        )}

      </section>
    </main>
  );
}
