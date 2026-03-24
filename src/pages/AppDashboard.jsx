import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { DurationPicker } from '../components/shared/DurationPicker';
import { SessionTypePicker } from '../components/shared/SessionTypePicker';
import { HistoryList } from '../components/history/HistoryList';
import { useSubscription, TIERS, TIER_LIMITS } from '../context/SubscriptionContext';
import { getSessions, getStreak } from '../firebase/database';
import './AppDashboard.css';

const DEFAULT_DURATION_KEY = 'cadence_default_duration';

export function AppDashboard() {
  const navigate = useNavigate();
  const { tier, todayCount, canStartSession, getLimits, setTier } = useSubscription();
  const [duration, setDuration] = useState(() => {
    return parseInt(localStorage.getItem(DEFAULT_DURATION_KEY) || '25');
  });
  const [sessionType, setSessionType] = useState('solo');
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastDate: null });
  const [goal, setGoal] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const limits = getLimits();
  const sessionCheck = canStartSession();

  useEffect(() => {
    setSessions(getSessions());
    setStreak(getStreak());
  }, []);

  // Show limit modal when Free user hits limit
  useEffect(() => {
    if (tier === TIERS.FREE && !sessionCheck.allowed) {
      setShowUpgradePrompt(true);
    }
  }, [tier, sessionCheck, todayCount]);

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
    if (!sessionCheck.allowed) {
      setShowUpgradePrompt(true);
      return;
    }
    const params = new URLSearchParams({ duration, type: sessionType });
    if (goal.trim()) params.set('goal', goal.trim());
    navigate(`/app/session/new?${params.toString()}`);
  };

  const tierLabel = limits.name;
  const isFree = tier === TIERS.FREE;
  const isPro = tier === TIERS.PRO;
  const isPremium = tier === TIERS.PREMIUM;

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
          <Link to="/app/stats" className="nav-link">Stats</Link>
          <Link to="/app/settings" className="nav-link">Settings</Link>
          <Link to="/pricing" className="nav-link nav-link-pricing">
            {isFree && <span className="upgrade-chip">Upgrade</span>}
            {tierLabel}
          </Link>
        </nav>
      </header>

      <main className="app-main">
        {/* Tier banner — Free users see upgrade nudge */}
        {isFree && (
          <div className="tier-banner">
            <div className="tier-banner-left">
              <FreeIcon />
              <div>
                <span className="tier-banner-label">Free plan</span>
                <span className="tier-banner-info">
                  {todayCount}/{limits.sessionsPerDay} sessions used today
                </span>
              </div>
            </div>
            <Link to="/pricing" className="tier-banner-action">
              Upgrade to Pro
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        )}

        {isPro && (
          <div className="tier-banner tier-banner-pro">
            <div className="tier-banner-left">
              <ProIcon />
              <div>
                <span className="tier-banner-label">Pro plan</span>
                <span className="tier-banner-info">Unlimited sessions. Focus analytics included.</span>
              </div>
            </div>
            <Link to="/pricing" className="tier-banner-action">
              Manage
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        )}

        {isPremium && (
          <div className="tier-banner tier-banner-premium">
            <div className="tier-banner-left">
              <PremiumIcon />
              <div>
                <span className="tier-banner-label">Premium plan</span>
                <span className="tier-banner-info">Team sessions & advanced analytics unlocked.</span>
              </div>
            </div>
            <Link to="/pricing" className="tier-banner-action">
              Manage
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        )}

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
          <div className="widget-header">
            <h2 className="widget-title">Start a session</h2>
            <div className="widget-tier-badge">
              {tierLabel}
            </div>
          </div>

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

          {/* Session limit warning for Free */}
          {isFree && (
            <div className="session-limit-hint">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6.5 5.5v3M6.5 4v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>
                {todayCount >= limits.sessionsPerDay
                  ? 'Daily limit reached. Upgrade for unlimited sessions.'
                  : `${limits.sessionsPerDay - todayCount} free session${limits.sessionsPerDay - todayCount !== 1 ? 's' : ''} left today.`}
              </span>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStart}
            disabled={isFree && !sessionCheck.allowed}
          >
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

      {/* Upgrade prompt modal */}
      {showUpgradePrompt && (
        <div className="modal-overlay" onClick={() => setShowUpgradePrompt(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="upgrade-modal-icon">
              <FreeIcon />
            </div>
            <h3 className="modal-title">Daily limit reached</h3>
            <p className="modal-body">
              You've used your 3 free sessions today. Upgrade to Pro for unlimited focus sessions, focus analytics, and more.
            </p>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setShowUpgradePrompt(false)}>
                Maybe later
              </Button>
              <Button variant="primary" onClick={() => {
                setShowUpgradePrompt(false);
                navigate('/pricing');
              }}>
                Upgrade to Pro — $4.99/mo
              </Button>
            </div>
          </div>
        </div>
      )}
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

function FreeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ProIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2l1.5 4h4l-3 2.5 1 4L8 10l-3.5 2.5 1-4L2.5 6h4z" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

function PremiumIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2l1.5 4h4l-3 2.5 1 4L8 10l-3.5 2.5 1-4L2.5 6h4z" fill="var(--color-partner)" stroke="var(--color-partner)" strokeWidth="0.5" strokeLinejoin="round"/>
    </svg>
  );
}
