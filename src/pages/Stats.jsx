import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getSessions, getStreak } from '../firebase/database';
import { getAchievements, ACHIEVEMENT_META } from '../components/achievements/Achievements';
import './Stats.css';

// Mock leaderboard data — in production this would come from Firebase
const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Priya M.',    hours: 42.5, sessions: 87, streak: 31 },
  { rank: 2, name: 'Tobias K.',   hours: 38.2, sessions: 74, streak: 22 },
  { rank: 3, name: 'You',         hours: 18.7, sessions: 41, streak: 7,  isYou: true },
  { rank: 4, name: 'Nadia R.',    hours: 16.1, sessions: 33, streak: 12 },
  { rank: 5, name: 'Sam L.',      hours: 14.9, sessions: 29, streak: 5  },
  { rank: 6, name: 'Jordan W.',  hours: 13.3, sessions: 26, streak: 9  },
  { rank: 7, name: 'Casey P.',    hours: 11.8, sessions: 22, streak: 3  },
  { rank: 8, name: 'Alex T.',     hours: 10.2, sessions: 20, streak: 14 },
  { rank: 9, name: 'Morgan D.',  hours:  9.7, sessions: 18, streak: 6  },
  { rank: 10, name: 'Riley H.',   hours:  8.4, sessions: 16, streak: 2  },
];

export function Stats() {
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastDate: null });
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    setSessions(getSessions());
    setStreak(getStreak());
    setAchievements(getAchievements());
  }, []);

  const personalStats = useMemo(() => {
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationWorked || s.duration), 0);
    const totalSessions = sessions.filter((s) => s.completed).length;
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekSessions = sessions.filter((s) => new Date(s.startedAt) >= weekStart);
    const weekMinutes = weekSessions.reduce((acc, s) => acc + (s.durationWorked || s.duration), 0);

    // Longest session
    const longestSession = sessions.reduce((max, s) => {
      const d = s.durationWorked || s.duration;
      return d > (max?.durationWorked || max?.duration || 0) ? s : max;
    }, null);

    // Best day (most minutes in a single day)
    const byDay = {};
    sessions.forEach((s) => {
      const day = new Date(s.startedAt).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + (s.durationWorked || s.duration);
    });
    const bestDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0] || [null, 0];

    return { totalMinutes, totalSessions, totalHours, weekMinutes, longestSession, bestDay };
  }, [sessions]);

  const weeklyGoalMinutes = 10 * 60; // 10 hours/week default
  const weeklyProgress = Math.min(personalStats.weekMinutes / weeklyGoalMinutes, 1);

  return (
    <div className="stats-page page page-enter">
      {/* Header */}
      <header className="stats-header">
        <Link to="/app" className="stats-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>
        <h1 className="stats-title">Focus Stats</h1>
        <div />
      </header>

      <main className="stats-main">
        {/* Personal stats grid */}
        <section className="stats-section">
          <h2 className="section-title">Personal Stats</h2>
          <div className="personal-stats-grid">
            <StatTile
              label="Total Focus"
              value={`${personalStats.totalHours}h`}
              sub={`${personalStats.totalSessions} completed sessions`}
              icon={<ClockIcon />}
              accent
            />
            <StatTile
              label="Current Streak"
              value={`${streak.current}d`}
              sub={`Best: ${streak.longest} days`}
              icon={<FlameIcon />}
              accent={streak.current > 0}
            />
            <StatTile
              label="This Week"
              value={`${Math.floor(personalStats.weekMinutes / 60)}h ${personalStats.weekMinutes % 60}m`}
              sub={`${Math.round(weeklyProgress * 100)}% of 10h goal`}
              icon={<CalendarIcon />}
            />
            <StatTile
              label="Longest Session"
              value={`${personalStats.longestSession ? (personalStats.longestSession.durationWorked || personalStats.longestSession.duration) : 0}m`}
              sub={personalStats.longestSession ? `on ${new Date(personalStats.longestSession.startedAt).toLocaleDateString()}` : 'No sessions yet'}
              icon={<TrophyIcon />}
            />
          </div>
        </section>

        {/* Weekly goal */}
        <section className="stats-section">
          <h2 className="section-title">Weekly Focus Goal</h2>
          <div className="weekly-goal-card card">
            <div className="goal-header">
              <span className="goal-label">10 hours this week</span>
              <span className="goal-pct">{Math.round(weeklyProgress * 100)}%</span>
            </div>
            <div className="goal-bar-track">
              <div
                className="goal-bar-fill"
                style={{ width: `${weeklyProgress * 100}%` }}
              />
            </div>
            <p className="goal-sub">
              {personalStats.weekMinutes >= weeklyGoalMinutes
                ? '🎉 Weekly goal achieved! Outstanding focus this week.'
                : `${Math.round((weeklyGoalMinutes - personalStats.weekMinutes) / 60 * 10) / 10}h left to hit your goal.`}
            </p>
          </div>
        </section>

        {/* Leaderboard */}
        <section className="stats-section">
          <h2 className="section-title">Weekly Leaderboard</h2>
          <div className="leaderboard card">
            <div className="leaderboard-header">
              <span>Rank</span>
              <span>Name</span>
              <span>Hours</span>
              <span>Sessions</span>
              <span>Streak</span>
            </div>
            {MOCK_LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                className={`leaderboard-row ${entry.isYou ? 'is-you' : ''} ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}
              >
                <span className="lb-rank">
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </span>
                <span className="lb-name">
                  {entry.name}
                  {entry.isYou && <span className="lb-you-badge">you</span>}
                </span>
                <span className="lb-hours">{entry.hours}h</span>
                <span className="lb-sessions">{entry.sessions}</span>
                <span className="lb-streak">
                  <FlameIcon />
                  {entry.streak}d
                </span>
              </div>
            ))}
          </div>
          <p className="leaderboard-note">
            Leaderboard resets every Monday. Rank is based on total focused hours.
          </p>
        </section>

        {/* Achievements */}
        <section className="stats-section">
          <h2 className="section-title">Achievements</h2>
          <div className="achievements-grid">
            {Object.entries(ACHIEVEMENT_META).map(([key, meta]) => {
              const earned = achievements.includes(key);
              return (
                <div key={key} className={`achievement-card ${earned ? 'earned' : 'locked'}`}>
                  <div className="achievement-icon-wrap">
                    <AchievementBadgeIcon id={key} earned={earned} />
                  </div>
                  <div className="achievement-info">
                    <span className="achievement-name">{meta.name}</span>
                    <span className="achievement-desc">{meta.description}</span>
                  </div>
                  {earned && <div className="achievement-earned-check">✓</div>}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatTile({ label, value, sub, icon, accent }) {
  return (
    <div className={`stat-tile card ${accent ? 'accent' : ''}`}>
      <div className="stat-tile-icon">{icon}</div>
      <div className="stat-tile-body">
        <span className="stat-tile-label">{label}</span>
        <span className="stat-tile-value">{value}</span>
        <span className="stat-tile-sub">{sub}</span>
      </div>
    </div>
  );
}

function AchievementBadgeIcon({ id, earned }) {
  const colors = {
    firstSession:  ['#60a5fa', '#3b82f6'],
    weekStreak:    ['#f472b6', '#ec4899'],
    monthStreak:   ['#fbbf24', '#f59e0b'],
    tenHours:      ['#4ade80', '#22c55e'],
    hundredHours:  ['#a78bfa', '#8b5cf6'],
    fiftySessions: ['#38bdf8', '#0ea5e9'],
    earlyBird:     ['#fb923c', '#f97316'],
    nightOwl:      ['#818cf8', '#6366f1'],
    perfectWeek:   ['#f472b6', '#db2777'],
  };
  const [c1, c2] = colors[id] || ['#94a3b8', '#64748b'];

  if (!earned) {
    return (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="15" fill="var(--surface-elevated)" stroke="var(--border-default)" strokeWidth="1.5"/>
        <path d="M18 12v8l4 4" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="18" cy="18" r="2" fill="var(--text-disabled)"/>
      </svg>
    );
  }

  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="15" fill={c1} opacity="0.15" stroke={c1} strokeWidth="1.5"/>
      <circle cx="18" cy="18" r="10" fill={c1} opacity="0.25"/>
      <circle cx="18" cy="18" r="5" fill={c2}/>
      {/* Badge star/sparkle */}
      <path d="M18 5l1 4h4l-3 2.5 1 4-3.5-2.5L14 16l1-4L12 9h4z" fill={c1} opacity="0.7"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3c0 4-4 6-4 10a4 4 0 008 0c0-2-1-3.5-2-5-.5 2-1.5 3-2 3V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M3 8h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 3h8v7a4 4 0 01-8 0V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M6 5H3a1 1 0 000 2h3M14 5h3a1 1 0 000-2h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M10 13v3M7 16h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
