import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSubscription, TIERS, TIER_LIMITS } from '../context/SubscriptionContext';
import { Button } from '../components/shared/Button';
import './Settings.css';

const DEFAULT_DURATION_KEY = 'cadence_default_duration';
const SOUND_KEY = 'cadence_default_sound';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { tier, todayCount } = useSubscription();
  const [defaultDuration, setDefaultDuration] = useState(() => {
    return parseInt(localStorage.getItem(DEFAULT_DURATION_KEY) || '25');
  });
  const [defaultSound, setDefaultSound] = useState(() => {
    return localStorage.getItem(SOUND_KEY) || 'none';
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(DEFAULT_DURATION_KEY, String(defaultDuration));
    localStorage.setItem(SOUND_KEY, defaultSound);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    if (window.confirm('Clear all session history and streak data? This cannot be undone.')) {
      localStorage.removeItem('cadence_station_sessions');
      localStorage.removeItem('cadence_station_streak');
      window.location.reload();
    }
  };

  return (
    <div className="settings-page page page-enter">
      {/* Header */}
      <header className="settings-header">
        <div className="settings-header-left">
          <Link to="/app" className="back-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
          <h1 className="settings-title">Settings</h1>
        </div>
      </header>

      <main className="settings-main">
        {/* Defaults */}
        <section className="settings-section">
          <h2 className="section-title">Session Defaults</h2>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Default duration</span>
              <span className="setting-desc">Pre-selected when starting a new session</span>
            </div>
            <select
              className="setting-select"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(parseInt(e.target.value))}
            >
              <option value={25}>25 minutes</option>
              <option value={50}>50 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Default ambient sound</span>
              <span className="setting-desc">Pre-selected when starting a new session</span>
            </div>
            <select
              className="setting-select"
              value={defaultSound}
              onChange={(e) => setDefaultSound(e.target.value)}
            >
              <option value="none">None</option>
              <option value="brownNoise">Brown Noise</option>
              <option value="whiteNoise">White Noise</option>
              <option value="cafe">Café</option>
              <option value="rain">Rain</option>
              <option value="forest">Forest</option>
              <option value="ocean">Ocean</option>
            </select>
          </div>
        </section>

        {/* Appearance */}
        <section className="settings-section">
          <h2 className="section-title">Appearance</h2>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Theme</span>
              <span className="setting-desc">Choose your preferred look</span>
            </div>
            <div className="theme-toggle">
              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => theme !== 'dark' && toggleTheme()}
              >
                <MoonIcon />
                Dark
              </button>
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => theme !== 'light' && toggleTheme()}
              >
                <SunIcon />
                Light
              </button>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="settings-section">
          <h2 className="section-title">Data</h2>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Session history</span>
              <span className="setting-desc">Stored locally on this device</span>
            </div>
            <Button variant="danger" size="sm" onClick={handleClearData}>
              Clear data
            </Button>
          </div>
        </section>

        {/* Subscription */}
        <section className="settings-section">
          <h2 className="section-title">Subscription</h2>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Current plan</span>
              <span className="setting-desc">Your active Cadence Station plan</span>
            </div>
            <div className="subscription-tier-display">
              {tier === TIERS.FREE && (
                <span className="tier-badge tier-free">Free</span>
              )}
              {tier === TIERS.PRO && (
                <span className="tier-badge tier-pro">Pro</span>
              )}
              {tier === TIERS.PREMIUM && (
                <span className="tier-badge tier-premium">Premium</span>
              )}
            </div>
          </div>

          {tier === TIERS.FREE && (
            <div className="setting-row setting-row-upgrade">
              <div className="setting-info">
                <span className="setting-label">Upgrade to Pro</span>
                <span className="setting-desc">Unlimited sessions, focus analytics, calendar integration</span>
              </div>
              <Button variant="primary" size="sm" to="/pricing">
                See plans
              </Button>
            </div>
          )}

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Daily sessions used</span>
              <span className="setting-desc">
                {tier === TIERS.FREE
                  ? `${todayCount} of ${TIER_LIMITS[TIERS.FREE].sessionsPerDay} free sessions today`
                  : 'Unlimited sessions available'}
              </span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="settings-section">
          <h2 className="section-title">About</h2>

          <div className="about-info">
            <div className="about-row">
              <span className="about-label">Version</span>
              <span className="about-value">1.0.0</span>
            </div>
            <div className="about-row">
              <span className="about-label">Built with</span>
              <span className="about-value">React + Vite + Firebase</span>
            </div>
          </div>

          <p className="about-note">
            Cadence Station — Find your rhythm. Together.
            No accounts, no leaderboards, no noise.
          </p>
        </section>

        {/* Save */}
        <div className="settings-save">
          <Button variant="primary" onClick={handleSave}>
            {saved ? 'Saved!' : 'Save settings'}
          </Button>
        </div>
      </main>
    </div>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1a6 6 0 100 12A6 6 0 007 1z" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.9 2.9l1.4 1.4M9.7 9.7l1.4 1.4M2.9 11.1l1.4-1.4M9.7 4.3l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
