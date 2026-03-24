import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { DurationPicker } from '../components/shared/DurationPicker';
import { SessionTypePicker } from '../components/shared/SessionTypePicker';
import { HistoryList } from '../components/history/HistoryList';
import { getSessions, getStreak } from '../firebase/database';
import './AppDashboard.css';

const DEFAULT_DURATION_KEY = 'cadence_default_duration';

export function AppDashboard() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(() => {
    return parseInt(localStorage.getItem(DEFAULT_DURATION_KEY) || '25');
  });
  const [sessionType, setSessionType] = useState('solo');
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastDate: null });
  const [goal, setGoal] = useState('');

  useEffect(() => {
    setSessions(getSessions());
    setStreak(getStreak());
  }, []);

  // Compute today's stats
  const { todayMinutes, todayCompleted, weekMinutes, weekSessionsCount } = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(
      (s) => new Date(s.startedAt).toISOString().split('T')[0] === todayStr
    );
    const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.durationWorked || s.duration), 0);
    const todayCompleted = todaySessions.filter((s) => s.completed).length;

    // This week's stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekSessions = sessions.filter((s) => new Date(s.startedAt) >= weekStart);
    const weekMinutes = weekSessions.reduce((acc, s) => acc + (s.durationWorked || s.duration), 0);
    const weekSessionsCount = weekSessions.length;

    return { todayMinutes, todayCompleted, weekMinutes, weekSessionsCount };
  }, [sessions]);

  const handleStart = () => {
    const params = new URLSearchParams({ duration, type: sessionType });
    if (goal.trim()) params.set('goal', goal.trim());
    navigate(`/app/session/new?${params.toString()}`);
  };

  return (
    <div className="app-dashboard page page-enter">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <StationIcon />
          <span>Cadence Station</span>
        </div>
        <nav className="app-nav">
          <Link to="/app/history" className="nav-link">History</Link>
          <Link to="/app/settings" className="nav-link">Settings</Link>
        </nav>
      </header>

      <main className="app-main">
        {/* Stats row */}
        <div className="stats-row">
          <StatCard
            label="Today"
            value={`${todayMinutes}m`}
            sub={`${todayCompleted} session${todayCompleted !== 1 ? 's' : ''}`}
            accent={todayMinutes > 0}
            className="card-enter"
          />
          <StatCard
            label="This week"
            value={`${Math.round(weekMinutes / 60)}h ${weekMinutes % 60}m`}
            sub={`${weekSessionsCount} session${weekSessionsCount !== 1 ? 's' : ''}`}
            className="card-enter"
          />
          <StatCard
            label="Streak"
            value={`${streak.current}d`}
            sub={`Best: ${streak.longest}d`}
            accent={streak.current > 0}
            className="card-enter"
          />
        </div>

        {/* Start session widget */}
        <div className="start-widget card">
          <h2 className="widget-title">Start a session</h2>

          <div className="widget-section">
            <span className="widget-label">Duration</span>
            <DurationPicker value={duration} onChange={setDuration} />
          </div>

          <div className="widget-section">
            <span className="widget-label">Type</span>
            <SessionTypePicker value={sessionType} onChange={setSessionType} />
          </div>

          {sessionType === 'paired' && (
            <div className="widget-section">
              <span className="widget-label">Goal <span className="optional">(optional)</span></span>
              <input
                type="text"
                className="goal-input"
                placeholder="What are you working on?"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                maxLength={120}
              />
            </div>
          )}

          <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
            {sessionType === 'solo' ? 'Start Solo Session' : 'Find a Partner & Start'}
          </Button>
        </div>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <div className="recent-section">
            <div className="recent-header">
              <h3 className="recent-title">Recent sessions</h3>
              <Link to="/app/history" className="recent-more">View all</Link>
            </div>
            <HistoryList sessions={sessions.slice(0, 5)} />
          </div>
        )}

        {sessions.length === 0 && (
          <div className="empty-state">
            <EmptyIcon />
            <p>No sessions yet. Pick a duration above and start focusing.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, accent, className }) {
  return (
    <div className={`stat-card card ${accent ? 'accent' : ''} ${className || ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <span className="stat-sub">{sub}</span>
    </div>
  );
}

function StationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="var(--color-accent)" strokeWidth="2"/>
      <circle cx="14" cy="14" r="5" fill="var(--color-accent)" opacity="0.3"/>
      <circle cx="14" cy="14" r="2.5" fill="var(--color-accent)"/>
      <path d="M14 4v3M14 21v3M4 14h3M21 14h3" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.2 }}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M24 14v10l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
