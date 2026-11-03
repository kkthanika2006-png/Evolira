import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Dashboard.css";
import { UserRound } from "lucide-react";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalDate() {
  return formatDate(new Date());
}

function getDateDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDate(date);
}

function getHabitStreak(habitId, completionRecords, today) {
  const completedDays = new Set(
    completionRecords
      .filter((record) => record.habit_id === habitId)
      .map((record) => record.completed_on)
  );

  let date = new Date();

  // If today's habit isn't complete yet, count the streak through yesterday.
  if (!completedDays.has(today)) {
    date.setDate(date.getDate() - 1);
  }

  let streak = 0;

  while (completedDays.has(formatDate(date))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

const avatarDetails = {
  child_male_1: { name: "Explorer", image: "/avatars/child-male-1.png" },
  child_female_1: { name: "Dreamer", image: "/avatars/child-female-1.png" },
  child_male_2: { name: "Achiever", image: "/avatars/child-male-2.png" },
  child_female_2: { name: "Creator", image: "/avatars/child-female-2.png" },

  adult_male_1: { name: "Visionary", image: "/avatars/adult-male-1.png" },
  adult_female_1: { name: "Leader", image: "/avatars/adult-female-1.png" },
  adult_male_2: { name: "Achiever", image: "/avatars/adult-male-2.png" },
  adult_female_2: { name: "Innovator", image: "/avatars/adult-female-2.png" },

  elder_male_1: { name: "Mentor", image: "/avatars/elder-male-1.png" },
  elder_female_1: { name: "Wise Soul", image: "/avatars/elder-female-1.png" },
  elder_male_2: { name: "Guardian", image: "/avatars/elder-male-2.png" },
  elder_female_2: { name: "Inspiration", image: "/avatars/elder-female-2.png" },
};


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [completionRecords, setCompletionRecords] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [newHabitDueTime, setNewHabitDueTime] = useState("");
  const [editingDueTime, setEditingDueTime] = useState("");

  const [notificationPermission, setNotificationPermission] = useState(() =>
  typeof window === "undefined" || !("Notification" in window)
    ? "unsupported"
    : Notification.permission
);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const today = getLocalDate();
  const avatarId = user?.user_metadata?.avatar_id;
  const selectedAvatar = avatarDetails[avatarId];

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(data.user);

      const [habitsResult, completionsResult] = await Promise.all([
        supabase
          .from("habits")
          .select("id, name, due_time")
          .eq("is_active", true)
          .order("created_at"),
        supabase
          .from("habit_completions")
          .select("habit_id, completed_on")
          .order("completed_on", { ascending: false }),
      ]);

      if (!active) return;

      if (habitsResult.error || completionsResult.error) {
        setMessage(
          habitsResult.error?.message || completionsResult.error?.message
        );
      } else {
        setHabits(habitsResult.data);
        setCompletionRecords(completionsResult.data);
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);
    
    useEffect(() => {
    if (notificationPermission !== "granted") return;

    const timers = [];

    habits.forEach((habit) => {
      if (!habit.due_time) return;

      const completedToday = completionRecords.some(
        (record) =>
          record.habit_id === habit.id && record.completed_on === today
      );

      if (completedToday) return;

      const [hours, minutes] = habit.due_time.split(":").map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);
      reminderTime.setTime(reminderTime.getTime() - 60 * 60 * 1000);

      const delay = reminderTime.getTime() - Date.now();
      if (delay <= 0) return;

      const timer = window.setTimeout(() => {
        new Notification("Evolira habit reminder", {
          body: `"${habit.name}" is due in one hour.`,
          icon: "/favicon-96x96.png",
          tag: `habit-${habit.id}-${today}`,
        });
      }, delay);

      timers.push(timer);
    });

    return () => timers.forEach(window.clearTimeout);
  }, [habits, completionRecords, notificationPermission, today]);

    async function handleEnableNotifications() {
    if (notificationPermission === "unsupported") {
      setMessage("This browser does not support notifications.");
      return;
    }

    if (notificationPermission === "denied") {
      setMessage("Notifications are blocked. Allow them in your browser settings.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    setMessage(
      permission === "granted"
        ? "Habit reminders are enabled. Keep the Dashboard open."
        : "Notification permission was not granted."
    );
  }

    async function handleAddHabit(event) {
    event.preventDefault();

    const name = newHabit.trim();
    if (!name || !user) return;

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        name,
        due_time: newHabitDueTime || null,
      })
      .select("id, name, due_time")
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setHabits((current) => [...current, data]);
    setNewHabit("");
    setNewHabitDueTime("");
  }

  async function handleToggleHabit(habitId) {
    if (!user) return;

    setMessage("");

    const isCompleteToday = completionRecords.some(
      (record) =>
        record.habit_id === habitId && record.completed_on === today
    );

    const result = isCompleteToday
      ? await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", habitId)
          .eq("user_id", user.id)
          .eq("completed_on", today)
      : await supabase.from("habit_completions").insert({
          habit_id: habitId,
          user_id: user.id,
          completed_on: today,
        });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }


    setCompletionRecords((current) =>
      isCompleteToday
        ? current.filter(
            (record) =>
              !(
                record.habit_id === habitId &&
                record.completed_on === today
              )
          )
        : [...current, { habit_id: habitId, completed_on: today }]
    );
  }

  function startEditing(habit) {
    setEditingHabitId(habit.id);
    setEditingName(habit.name);
    setEditingDueTime(habit.due_time?.slice(0, 5) || "");
    setMessage("");
  }

  async function handleSaveEdit(event, habitId) {
    event.preventDefault();

    const name = editingName.trim();
    if (!name || !user) return;

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("habits")
      .update({ name, due_time: editingDueTime || null })
      .eq("id", habitId)
      .eq("user_id", user.id)
      .select("id, name, due_time")
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setHabits((current) =>
      current.map((habit) => (habit.id === habitId ? data : habit))
    );
    setEditingHabitId(null);
    setEditingName("");
  }

  async function handleDeleteHabit(habit) {
    const confirmed = window.confirm(
      `Delete "${habit.name}" and its completion history?`
    );

    if (!confirmed || !user) return;

    setMessage("");
    setDeletingId(habit.id);

    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", habit.id)
      .eq("user_id", user.id);

    setDeletingId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setHabits((current) => current.filter((item) => item.id !== habit.id));
    setCompletionRecords((current) =>
      current.filter((record) => record.habit_id !== habit.id)
    );
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/login", { replace: true });
  }

  if (loading) {
    return <main className="dashboard-page">Loading your dashboard...</main>;
  }

  const displayName = user?.user_metadata?.full_name || user?.email;
  const completedToday = habits.filter((habit) =>
    completionRecords.some(
      (record) =>
        record.habit_id === habit.id && record.completed_on === today
    )
  ).length;
  const progressPercent = habits.length
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

  const weekStart = getDateDaysAgo(6);
  const weeklyCompletions = completionRecords.filter(
    (record) =>
      record.completed_on >= weekStart && record.completed_on <= today
  ).length;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
         <a className="dashboard-brand" href="/">Evolira</a>
        <div className="dashboard-header-actions">
  <Link to="/profile" className="profile-link">
    Profile
  </Link>

  <button className="logout-button" onClick={handleLogout}>
    Log out
  </button>
</div>
  </header>

      <section className="dashboard-content">
        <p className="dashboard-eyebrow">YOUR DAILY PROGRESS</p>
        <h1>Welcome, {displayName}!</h1>
        <p className="dashboard-subtitle">
          Small steps today. A stronger you tomorrow.
        </p>
      
       {selectedAvatar && (
         <div className="dashboard-character">
         <div className="dashboard-character-image">
          <img
        src={selectedAvatar.image}
        alt={selectedAvatar.name}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <UserRound size={30} />
    </div>

    <div>
      <span className="character-label">YOUR CHARACTER</span>
      <h3>{selectedAvatar.name}</h3>
      <p>Your journey is in progress</p>
    </div>
  </div>
 )}
 <Link to="/characters" className="profile-link">
  Change character
</Link>


        <section className="dashboard-stats">
          <article className="stat-card">
            <span>Habits today</span>
            <strong>{habits.length}</strong>
          </article>
          <article className="stat-card">
            <span>Completed today</span>
            <strong>{completedToday}</strong>
          </article>
          <article className="stat-card">
            <span>Completions this week</span>
            <strong>{weeklyCompletions}</strong>
          </article>
        </section>

        <section className="daily-progress" aria-label="Daily habit progress">
          <div className="progress-label">
            <span>Today’s progress</span>
            <strong>{completedToday} of {habits.length} completed</strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={habits.length || 1}
            aria-valuenow={completedToday}
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </section>
         
                 {notificationPermission !== "granted" && (
          <button
            type="button"
            className="logout-button"
            onClick={handleEnableNotifications}
          >
            Enable habit reminders
          </button>
        )}

        <form className="habit-form" onSubmit={handleAddHabit}>
          <label htmlFor="new-habit">Add a daily habit</label>
          <div className="habit-form-row">
            <input
              id="new-habit"
              value={newHabit}
              onChange={(event) => setNewHabit(event.target.value)}
              placeholder="For example, read for 10 minutes"
              maxLength={80}
              required
            />
            <input
              type="time"
              aria-label="Habit due time (optional)"
              value={newHabitDueTime}
              onChange={(event) => setNewHabitDueTime(event.target.value)}
            />
            <button type="submit" disabled={saving}>
              {saving ? "Adding..." : "Add habit"}
            </button>
          </div>
        </form>

        {message && (
          <p className="dashboard-message" role="status">{message}</p>
        )}

        <section className="habit-section">
          <h2>Today’s habits</h2>

          {habits.length === 0 ? (
            <div className="empty-habits">
              <p className="empty-habits-title">A fresh start begins here.</p>
              <p>Add your first daily habit above and build momentum one day at a time.</p>
            </div>
          ) : (
            <ul className="habit-list">
              {habits.map((habit) => {
                const isComplete = completionRecords.some(
                  (record) =>
                    record.habit_id === habit.id &&
                    record.completed_on === today
                );
                
                const streak = getHabitStreak(
                  habit.id,
                  completionRecords,
                  today
                );
                const isEditing = editingHabitId === habit.id;

                return (
                  <li className="habit-item" key={habit.id}>
                    {isEditing ? (
                      <form
                        className="habit-edit-form"
                        onSubmit={(event) =>
                          handleSaveEdit(event, habit.id)
                        }
                      >
                          <input
                          aria-label="Edit habit name"
                          value={editingName}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          maxLength={80}
                          required
                        />
                      <input
                          type="time"
                          aria-label="Edit habit due time"
                          value={editingDueTime}
                          onChange={(event) =>
                            setEditingDueTime(event.target.value)
                          }
                        />
                        <button type="submit" disabled={saving}>
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="cancel-edit-button"
                          onClick={() => setEditingHabitId(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className="habit-details">
                          <span className={isComplete ? "habit-done" : ""}>
                            {habit.name}
                          </span>
                          <small>
                            {streak > 0
                              ? `🔥 ${streak}-day streak`
                              : "Start a streak today"}
                          </small>
                          {habit.due_time && (
                              <small>Due at {habit.due_time.slice(0, 5)}</small>
                         )}
                        </div>

                        <div className="habit-actions">
                          <button
                            className={
                              isComplete
                                ? "habit-toggle is-done"
                                : "habit-toggle"
                            }
                            onClick={() => handleToggleHabit(habit.id)}
                          >
                            {isComplete ? "Completed ✓" : "Mark done"}
                          </button>
                          <button
                            className="habit-edit-button"
                            onClick={() => startEditing(habit)}
                          >
                            Edit
                          </button>
                          <button
                            className="habit-delete"
                            onClick={() => handleDeleteHabit(habit)}
                            disabled={deletingId === habit.id}
                          >
                            {deletingId === habit.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>

                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}