import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HistoryList } from '../components/history/HistoryList';
import { Button } from '../components/shared/Button';
import { getSessions, getStreak } from '../firebase/database';
import './History.css';

export function History() {
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastDate: null });
  const [filter, setFilter] = useState('all'); // all | solo | paired

  useEffect(() => {
    setSessions(getSessions());
    setStreak(getStreak());
  }, []);

  const filtered = filter === 'all'
    ? sessions
    : sessions.filter((s) => s.type === filter);

  // Totals
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationWorked || s.duration), 0);
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.completed).length;

  // Streak display
  const [streakActive, setStreakActive] = useState(false);
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    setStreakActive(streak.lastDate === today || streak.lastDate === yesterday);
  }, [streak.lastDate]);

  return (
    <div className="history-page page page-enter">
      {/* Header */}
      <header className="history-header">
        <div className="history-header-left">
          <Link to="/app" className="back-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
          <h1 className="history-title">History</h1>
        </div>
      </header>

      <main className="history-main">
        {/* Summary stats */}
        <div className="history-stats">
          <div className="history-stat">
            <span className="hs-value">{totalSessions}</span>
            <span className="hs-label">Total sessions</span>
          </div>
          <div className="history-stat">
            <span className="hs-value">{Math.round(totalMinutes / 60)}h {totalMinutes % 60}m</span>
            <span className="hs-label">Focus time</span>
          </div>
          <div className="history-stat">
            <span className="hs-value">{completedSessions}</span>
            <span className="hs-label">Completed</span>
          </div>
          <div className="history-stat">
            <span className={`hs-value ${streakActive ? 'active' : ''}`}>
              {streak.current}d
            </span>
            <span className="hs-label">Current streak</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="history-filters">
          {['all', 'solo', 'paired'].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && ` (${sessions.length})`}
              {f === 'solo' && ` (${sessions.filter(s => s.type === 'solo').length})`}
              {f === 'paired' && ` (${sessions.filter(s => s.type === 'paired').length})`}
            </button>
          ))}
        </div>

        {/* Sessions list */}
        <HistoryList sessions={filtered} />
      </main>
    </div>
  );
}
